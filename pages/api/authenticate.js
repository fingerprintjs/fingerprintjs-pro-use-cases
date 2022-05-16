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

// Defines db model for login attempt
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
  'https://nextjs-dmv5c7--3000.local.webcontainer.io',
  'https://jellyfish-app-cnbob.ondigitalocean.app',
  'https://localhost:3000',
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

export default async (req, res) => {
  // This API route accepts only POST requests.
  if (req.method !== 'POST') {
    res.status(405).send({ message: 'Only POST requests allowed' });
    return;
  }

  res.setHeader('Content-Type', 'application/json');

  // Get requestId and visitorId from the client.
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const userName = req.body.userName;
  const password = req.body.password;

  // Information from the client side might have been tampered.
  // It's a best practice to validate provided information with Server API. It is recommended to use the requestId and visitorId pair.
  const visitorData = await getVisitorData(visitorId, requestId);

  // Check if the Server API contains info about this specific identification request.
  // If not, the request might have been edited and we don't trust this identification attempt.
  if (visitorData.visits.length === 0) {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.RequestIdMissmatch
    );
    return getForbiddenReponse(
      res,
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no login attempt was performed.'
    );
  }

  // The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
  // If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
  // More info: https://dev.fingerprintjs.com/docs/understanding-your-confidence-score
  if (visitorData.visits[0].confidence.score < 0.99) {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.LowConfidenceScore
    );

    return getForbiddenReponse(
      res,
      "Low confidence score, we'd rather verify you with the second factor,"
    );
  }

  // An attacker might have acquired valid requestId and visitorId via phishing.
  // It's recommended to check age of the identification request with the Server API.
  if (new Date().getTime() - visitorData.visits[0].timestamp > 3000) {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.OldTimestamp
    );

    return getForbiddenReponse(
      res,
      'Old requestId detected. Login attempt ignored and logged.'
    );
  }

  // Get all unsuccessful attempts during the last 24 hours.
  // If the visitorId performed 5 unsuccessful login attempts during the last 24 hours we do not perform login and we notify the user with the next steps according to internal processes.
  // The count of attempts and time window might vary.
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

  if (visitorLoginAttemptCountQueryResult.count > 4) {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.TooManyAttempts
    );

    return getForbiddenReponse(
      res,
      'You had more than 5 attempts during the last 24 hours. This login attempt was not performed.'
    );
  }

  // Check if the authentication request comes from the same IP adress as identification request.
  // This check is disabled on purpose in the Stackblitz environment.
  // if (
  //   req.headers['x-forwarded-for'].split(',')[0] !== visitorData.visits[0].ip
  // ) {
  //   reportSuspiciousActivityAccordintInternalProcesses(req);
  //   await logLoginAttempt(
  //     visitorData.visitorId,
  //     userName,
  //     loginAttemptResult.IpMismatch
  //   );

  //   return getForbiddenReponse(
  //     res,
  //     'IP mismatch. An attacker might have tried to phish the victim.'
  //   );
  // }

  // Check if the authentication request comes from the known origin
  // Check if the authentication request's origin corresponds to the origin/URL provided by the FingerprintJSPro Server API.
  // Additionally, one should set Request Filtering settings in the dashboard: https://dev.fingerprintjs.com/docs/request-filtering
  const visitorDataOrigin = new URL(visitorData.visits[0].url).origin;
  if (
    // visitorDataOrigin !== req.headers['origin'] || // This check is commented out because of different origins on the Stackblitz environment
    !ourOrigins.includes(visitorDataOrigin) ||
    !ourOrigins.includes(req.headers['origin'])
  ) {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.ForeignOrigin
    );

    return getForbiddenReponse(
      res,
      'Origin mismatch. An attacker might have tried to phish the victim.'
    );
  }

  // Check if the provided credentials are correct.
  // If they provided valid credentials but they never logged in using this visitorId, we recommend using an additional way of verification, e.g. 2FA or email.
  if (areCredentialsCorrect(userName, password)) {
    if (
      isLoggingInFromKnownDevice(
        visitorData.visitorId,
        mockedUser.knownVisitorIds
      )
    ) {
      await logLoginAttempt(
        visitorData.visitorId,
        userName,
        loginAttemptResult.Passed
      );

      return getOkReponse(res, 'We logged you in successfully.');
    } else {
      await logLoginAttempt(
        visitorData.visitorId,
        userName,
        loginAttemptResult.Challenged
      );

      return getOkReponse(
        res,
        "Provided credentials are correct but we've never seen you logging in using this device. Proof your identify with a second factor."
      );
    }
  } else {
    reportSuspiciousActivityAccordintInternalProcesses(req);
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.IncorrectCredentials
    );

    return getForbiddenReponse(res, 'Incorrect credentials, try again.');
  }
};

// Every identification request should be validated using FingerprintJS Pro Server API.
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
  const fingerprintJSProServerApiUrl = new URL(
    `https://api.fpjs.io/visitors/${visitorId}`
  );

  fingerprintJSProServerApiUrl.searchParams.append(
    'api_key',
    'F6gQ8H8vQLc7mVsVKaFx' // In the real world use-case, we recommend using Auth-API-Key header instead: https://dev.fingerprintjs.com/docs/server-api#api-methods. Api key should be stored in the environment variables/secrets.
  );
  fingerprintJSProServerApiUrl.searchParams.append('request_id', requestId);

  const visitorServerApiResponse = await fetch(
    fingerprintJSProServerApiUrl.href
  );

  return await visitorServerApiResponse.json();
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
function reportSuspiciousActivityAccordintInternalProcesses(context) {}

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

function getOkReponse(res, message) {
  return res.status(200).json({ message });
}

function getForbiddenReponse(res, message) {
  return res.status(403).json({ message });
}
