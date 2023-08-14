import { DataTypes, Op } from 'sequelize';
import {
  ensurePostRequest,
  ensureValidRequestIdAndVisitorId,
  getVisitorDataWithRequestId,
  messageSeverity,
  reportSuspiciousActivity,
  sequelize,
} from '../../../server/server';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import {
  checkConfidenceScore,
  checkFreshIdentificationRequest,
  checkIpAddressIntegrity,
  checkOriginsIntegrity,
} from '../../../server/checks';
import { sendForbiddenResponse, sendOkResponse } from '../../../server/response';

// Mocked user with leaked credentials associated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: getKnownVisitorIds(),
};

// Defines db model for login attempt.
export const LoginAttempt = sequelize.define('login-attempt', {
  visitorId: {
    type: DataTypes.STRING,
  },
  userName: {
    type: DataTypes.STRING,
  },
  loginAttemptResult: {
    type: DataTypes.STRING,
  },
  timestamp: {
    type: DataTypes.DATE,
  },
});

LoginAttempt.sync({ force: false });

function getKnownVisitorIds() {
  const defaultVisitorIds = ['bXbwuhCBRB9lLTK692vw', 'ABvLgKyH3fAr6uAjn0vq', 'BNvLgKyHefAr9iOjn0ul'];
  const visitorIdsFromEnv = process.env.KNOWN_VISITOR_IDS?.split(',');

  console.info(`Extracted ${visitorIdsFromEnv?.length ?? 0} visitorIds from env.`);

  return visitorIdsFromEnv ? [...defaultVisitorIds, ...visitorIdsFromEnv] : defaultVisitorIds;
}

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
  const visitorData = await getVisitorDataWithRequestId(visitorId, requestId);

  for (const ruleCheck of ruleChecks) {
    const result = await ruleCheck(visitorData, req);

    if (result) {
      await logLoginAttempt(visitorId, userName, result.type);

      switch (result.type) {
        case checkResultType.Passed:
        case checkResultType.Challenged:
          return sendOkResponse(res, result);
        default:
          reportSuspiciousActivity(req);
          return sendForbiddenResponse(res, result);
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
        [Op.gt]: new Date().getTime() - 24 * 60 * 1000,
      },
      loginAttemptResult: {
        [Op.not]: checkResultType.Passed,
        [Op.not]: checkResultType.TooManyLoginAttempts,
        [Op.not]: checkResultType.Challenged,
      },
    },
  });

  // If the visitorId performed 5 unsuccessful login attempts during the last 24 hours we do not perform the login.
  // The count of attempts and time window might vary.
  if (visitorLoginAttemptCountQueryResult.count > 5) {
    return new CheckResult(
      'You had more than 5 attempts during the last 24 hours. This login attempt was not performed.',
      messageSeverity.Error,
      checkResultType.TooManyLoginAttempts,
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
        checkResultType.Challenged,
      );
    }
  } else {
    return new CheckResult(
      'Incorrect credentials, try again.',
      messageSeverity.Error,
      checkResultType.IncorrectCredentials,
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
