import { Sequelize } from 'sequelize';
import fetch from 'node-fetch';

// Provision the database.
// In the Stackblitz environment, this db is stored locally in your browser.
// On the deployed demo, db is cleaned after each deployment.
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: '.data/database.sqlite',
  logging: false,
});

// Defines db model for login attempt.
const LoginAttempt = sequelize.define('login-attempt', {
  visitorId: {
    type: Sequelize.STRING,
  },
  userName: {
    type: Sequelize.STRING,
  },
  timestamp: {
    type: Sequelize.DATE,
  },
  loginAttemptResult: {
    type: Sequelize.STRING,
  },
});

LoginAttempt.sync({ force: true });

// Demo origins.
// It is recommended to use production origins instead.
const ourOrigins = [
  'https://jellyfish-app-cnbob.ondigitalocean.app',
  'https://localhost:3000',
  'http://localhost:3000',
];

// Mocked user with leaked credentials asociated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: [
    'bXbwuhCBRB9lLTK692vw',
    'ABvLgKyH3fAr6uAjn0vq',
    'BNvLgKyHefAr9iOjn0ul',
  ],
};

class CheckResult {
  constructor(message, messageSeverity, type) {
    this.message = message;
    this.messageSeverity = messageSeverity;
    this.type = type;
  }
}

const loginAttemptResult = Object.freeze({
  LowConfidenceScore: 'LowConfidenceScore',
  RequestIdMissmatch: 'RequestIdMissmatch',
  OldTimestamp: 'OldTimestamp',
  TooManyAttempts: 'TooManyAttempts',
  IncorrectCredentials: 'IncorrectCredentials',
  Challenged: 'Challenged',
  ForeignOrigin: 'ForeignOrigin',
  IpMismatch: 'IpMismatch',
  Passed: 'Passed',
});

const messageSeverity = Object.freeze({
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
});

async function login(req, res, ruleChecks) {
  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const userName = req.body.userName;

  // Validate format of visitorId and requestId.
  const isRequestIdFormatValid = /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
  const isVisitorIdFormatValid = /^[a-zA-Z0-9]{20}$/.test(visitorId);

  if (!isRequestIdFormatValid || !isVisitorIdFormatValid) {
    reportSuspiciousActivity(req);
    return getForbiddenReponse(
      res,
      "Forged visitorId or requestId detected. Try harder next time.",
      messageSeverity.Error,
    );
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
        case loginAttemptResult.Passed:
        case loginAttemptResult.Challenged:
          return getOkReponse(res, result.message, result.messageSeverity);
        default:
          reportSuspiciousActivity(req);
          return getForbiddenReponse(
            res,
            result.message,
            result.messageSeverity
          );
      }
    }
  }
}

export default async (req, res) => {
  // This API route accepts only POST requests.
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }
  res.setHeader('Content-Type', 'application/json');

  return await login(req, res, [
    checkFreshIdentificationRequest,
    checkConfidenceScore,
    checkUnsuccessfulIdentifications,
    checkIpAddressIntegrity,
    checkOriginsIntegrity,
    checkCredentialsAndKnownVisitorIds,
  ]);
};

// Every identification request should be validated using the FingerprintJS Pro Server API.

// Alternatively, on the Node.js environment one can use Server API Node.js library: https://github.com/fingerprintjs/fingerprintjs-pro-server-api-node-sdk
// const client = new FingerprintJsServerApiClient({
//   region: Region.Global,
//   apiKey: 'F6gQ8H8vQLc7mVsVKaFx',
//   authenticationMode: AuthenticationMode.QueryParameter,
// });

// const serverApiFilter = { request_id: requestId };
// const visitorData = await client.getVisitorHistory(
//   visitorId,
//   serverApiFilter
// );
// return visitorData;

async function getVisitorData(visitorId, requestId) {
  // Do not request Server API if provided data is obviously forged,
  // return an error instead.
  if (!visitorId || !requestId) {
    return {error: "visitorId or requestId not provided."};
  }

  const fingerprintJSProServerApiUrl = new URL(
    `https://api.fpjs.io/visitors/${visitorId}`
  );

  fingerprintJSProServerApiUrl.searchParams.append(
    'api_key',
    // In a real world use-case, we recommend using Auth-API-Key header instead: https://dev.fingerprintjs.com/docs/server-api#api-methods.
    // The API key should be stored in the environment variables/secrets.
    'F6gQ8H8vQLc7mVsVKaFx'
  );
  fingerprintJSProServerApiUrl.searchParams.append('request_id', requestId);

  const visitorServerApiResponse = await fetch(
    fingerprintJSProServerApiUrl.href
  );

  // If there's something wrong with provided data, Server API might return non 200 response.
  // We consider these data unreliable.
  if (visitorServerApiResponse.status !== 200) {
    return {error: "Server API error"};
  }

  return await visitorServerApiResponse.json();
}

function checkFreshIdentificationRequest(visitorData) {
  // The Server API must contain information about this specific identification request.
  // If not, the request might have been tampered with and we don't trust this identification attempt.
  if (visitorData.error || visitorData.visits.length !== 1) {
    return new CheckResult(
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no login attempt was performed.',
      messageSeverity.Error,
      loginAttemptResult.RequestIdMissmatch
    );
  }

  // An attacker might have acquired a valid requestId and visitorId via phishing.
  // It's recommended to check freshness of the identification request to prevent replay attacks.
  if (new Date().getTime() - visitorData.visits[0].timestamp > 3000) {
    return new CheckResult(
      'Old requestId detected. Login attempt ignored and logged.',
      messageSeverity.Error,
      loginAttemptResult.OldTimestamp
    );
  }
}

function checkConfidenceScore(visitorData) {
  // The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
  // If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
  // More info: https://dev.fingerprintjs.com/docs/understanding-your-confidence-score
  if (visitorData.visits[0].confidence.score < 0.98) {
    return new CheckResult(
      "Low confidence score, we'd rather verify you with the second factor,",
      messageSeverity.Error,
      loginAttemptResult.LowConfidenceScore
    );
  }
}

async function checkUnsuccessfulIdentifications(visitorData) {
  // Gets all unsuccessful attempts during the last 24 hours.
  const visitorLoginAttemptCountQueryResult =
    await LoginAttempt.findAndCountAll({
      where: {
        visitorId: visitorData.visitorId,
        timestamp: {
          [Sequelize.Op.gt]: new Date().getTime() - 24 * 60 * 1000,
        },
        loginAttemptResult: {
          [Sequelize.Op.not]: loginAttemptResult.Passed,
          [Sequelize.Op.not]: loginAttemptResult.TooManyAttempts,
          [Sequelize.Op.not]: loginAttemptResult.Challenged,
        },
      },
    });

  // If the visitorId performed 5 unsuccessful login attempts during the last 24 hours we do not perform the login.
  // The count of attempts and time window might vary.
  if (visitorLoginAttemptCountQueryResult.count > 5) {
    return new CheckResult(
      'You had more than 5 attempts during the last 24 hours. This login attempt was not performed.',
      messageSeverity.Error,
      loginAttemptResult.TooManyAttempts
    );
  }
}

function checkIpAddressIntegrity(visitorData, request) {
  // Checks if the authentication request comes from the same IP adress as the identification request.
  if (
    process.env.NODE_ENV !== 'development' && // This check is disabled on purpose in the Stackblitz and localhost environments.
    // This is an example of obtaining the client IP address.
    // In most cases, it's a good idea to look for the right-most external IP address in the list to prevent spoofing.
    request.headers['x-forwarded-for'].split(',')[0] !==
    visitorData.visits[0].ip
  ) {
    return new CheckResult(
      'IP mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      loginAttemptResult.IpMismatch
    );
  }
}

function checkOriginsIntegrity(visitorData, request) {
  // Checks if the authentication request comes from a known origin and
  // if the authentication request's origin corresponds to the origin/URL provided by the FingerprintJSPro Server API.
  // Additionally, one should set Request Filtering settings in the dashboard: https://dev.fingerprintjs.com/docs/request-filtering
  const visitorDataOrigin = new URL(visitorData.visits[0].url).origin;
  if (
    process.env.NODE_ENV !== 'development' && // This check is disabled on purpose in the Stackblitz and localhost environments.
    (visitorDataOrigin !== request.headers['origin'] ||
      !ourOrigins.includes(visitorDataOrigin) ||
      !ourOrigins.includes(request.headers['origin']))
  ) {
    return new CheckResult(
      'Origin mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      loginAttemptResult.ForeignOrigin
    );
  }
}

async function checkCredentialsAndKnownVisitorIds(visitorData, request) {
  // Checks if the provided credentials are correct.
  if (areCredentialsCorrect(request.body.userName, request.body.password)) {
    if (
      isLoggingInFromKnownDevice(
        visitorData.visitorId,
        mockedUser.knownVisitorIds
      )
    ) {
      return new CheckResult(
        'We logged you in successfully.',
        messageSeverity.Success,
        loginAttemptResult.Passed
      );
      // If they provided valid credentials but they never logged in using this visitorId,
      // we recommend using an additional way of verification, e.g. 2FA or email.
    } else {
      return new CheckResult(
        "Provided credentials are correct but we've never seen you logging in using this device. Proof your identify with a second factor.",
        messageSeverity.Warning,
        loginAttemptResult.Challenged
      );
    }
  } else {
    return new CheckResult(
      'Incorrect credentials, try again.',
      messageSeverity.Error,
      loginAttemptResult.IncorrectCredentials
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

// Report suspicious user activity according to internal processes here.
// Possibly this action could also lock the user's account temporarily.
function reportSuspiciousActivity(context) {}

// Persists login attempt to the database.
async function logLoginAttempt(visitorId, userName, loginAttemptResult) {
  await LoginAttempt.create({
    visitorId,
    userName,
    timestamp: new Date().getTime(),
    loginAttemptResult,
  });
  await sequelize.sync();
}

function getOkReponse(res, message, messageSeverity) {
  return res.status(200).json({ message, severity: messageSeverity });
}

function getForbiddenReponse(res, message, messageSeverity) {
  return res.status(403).json({ message, severity: messageSeverity });
}
