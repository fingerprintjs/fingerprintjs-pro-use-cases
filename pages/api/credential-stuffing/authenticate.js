import { Sequelize } from 'sequelize';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
  CheckResult,
  checkResultType,
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getForbiddenResponse,
  getOkResponse,
  getVisitorData,
  messageSeverity,
  reportSuspiciousActivity,
  sequelize,
} from '../../../server/server';

// Defines db model for login attempt.
export const LoginAttempt = sequelize.define('login-attempt', {
  visitorId: {
    type: Sequelize.STRING,
  },
  userName: {
    type: Sequelize.STRING,
  },
  loginAttemptResult: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
});

LoginAttempt.sync({ force: false });

// Mocked user with leaked credentials associated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: ['bXbwuhCBRB9lLTK692vw', 'ABvLgKyH3fAr6uAjn0vq', 'BNvLgKyHefAr9iOjn0ul'],
};

export default async function handler(req, res) {
  // This API route accepts only POST requests.
  if (!ensurePostRequest(req, res)) {
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  return await tryToLogin(req, res, [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
    checkUnsuccessfulIdentifications,
    checkCredentialsAndKnownVisitorIds,
  ]);
}

async function tryToLogin(req, res, ruleChecks) {
  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const userName = req.body.userName;

  if (!ensureValidRequestIdAndVisitorId(req, res, visitorId, requestId)) {
    return;
  }

  // Information from the client side might have been tampered.
  // It's best practice to validate provided information with the Server API.
  // It is recommended to use the requestId and visitorId pair.
  const visitorData = await getVisitorData(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      await logLoginAttempt(visitorId, userName, result.type);

      switch (result.type) {
        case checkResultType.Passed:
        case checkResultType.Challenged:
          return getOkResponse(res, result.message, result.messageSeverity);
        default:
          reportSuspiciousActivity(req);
          return getForbiddenResponse(res, result.message, result.messageSeverity);
      }
    }
  }
}

async function checkUnsuccessfulIdentifications(visitorData) {
  // Gets all unsuccessful attempts during the last 24 hours.
  const visitorLoginAttemptCountQueryResult = await LoginAttempt.findAndCountAll({
    where: {
      visitorId: visitorData.visitorId,
      timestamp: {
        [Sequelize.Op.gt]: new Date().getTime() - 24 * 60 * 1000,
      },
      loginAttemptResult: {
        [Sequelize.Op.not]: checkResultType.Passed,
        [Sequelize.Op.not]: checkResultType.TooManyLoginAttempts,
        [Sequelize.Op.not]: checkResultType.Challenged,
      },
    },
  });

  // If the visitorId performed 5 unsuccessful login attempts during the last 24 hours we do not perform the login.
  // The count of attempts and time window might vary.
  if (visitorLoginAttemptCountQueryResult.count > 5) {
    return new CheckResult(
      'You had more than 5 attempts during the last 24 hours. This login attempt was not performed.',
      messageSeverity.Error,
      checkResultType.TooManyLoginAttempts
    );
  }
}

async function checkCredentialsAndKnownVisitorIds(visitorData, request) {
  // Checks if the provided credentials are correct.
  if (areCredentialsCorrect(request.body.userName, request.body.password)) {
    if (isLoggingInFromKnownDevice(visitorData.visitorId, mockedUser.knownVisitorIds)) {
      return new CheckResult('We logged you in successfully.', messageSeverity.Success, checkResultType.Passed);
      // If they provided valid credentials but they never logged in using this visitorId,
      // we recommend using an additional way of verification, e.g. 2FA or email.
    } else {
      return new CheckResult(
        "Provided credentials are correct but we've never seen you logging in using this device. Confirm your identity with a second factor.",
        messageSeverity.Warning,
        checkResultType.Challenged
      );
    }
  } else {
    return new CheckResult(
      'Incorrect credentials, try again.',
      messageSeverity.Error,
      checkResultType.IncorrectCredentials
    );
  }
}

// Dummy action simulating authentication.
function areCredentialsCorrect(name, password) {
  return name === mockedUser.userName && password === mockedUser.password;
}

// Checks if the provided visitorId is associated with the user.
function isLoggingInFromKnownDevice(providedVisitorId, knownVisitorIds) {
  return knownVisitorIds.includes(providedVisitorId);
}

// Persists login attempt to the database.
async function logLoginAttempt(visitorId, userName, loginAttemptResult) {
  await LoginAttempt.create({
    visitorId,
    userName,
    loginAttemptResult,
    timestamp: new Date().getTime(),
  });
  await sequelize.sync();
}
