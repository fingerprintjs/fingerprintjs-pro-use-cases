import { Sequelize } from 'sequelize';
import fetch from 'node-fetch';

// Provision database
const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: '.data/database.sqlite',
  logging: false,
});

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

// Mocked user with leaked credentials asociated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: [
    'QYvLgKyLefAr3uAjn0uv',
    'ABvLgKyH3fAr6uAjn0vq',
    'BNvLgKyHefAr9iOjn0ul',
  ],
};

export default async (req, res) => {
  // Get requestId and visitorId from the client
  const visitorId = req.body.visitorId;
  const requestId = req.body.requestId;
  const userName = req.body.userName;
  const password = req.body.password;

  // Get data about identification from FingerprintJS Pro servers
  const visitorData = await getVisitorData(visitorId, requestId);

  res.setHeader('Content-Type', 'application/json');

  // VisitorId does not match the requestId
  if (visitorData.visits.length === 0) {
    // Report suspicious user activity according to internal processes here

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
  //#endregion

  //#region Check confidence score
  if (visitorData.visits[0].confidence.score < 0.99) {
    // Report suspicious user activity according to internal processes here

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
  //#endregion

  //#region Check age of requestId
  if (new Date().getTime() - visitorData.visits[0].timestamp > 5000) {
    // Report suspicious user activity according to internal processes here

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
  //#endregion

  //#region Check all unsuccessful attempt during last 24 hours
  // Get all unsuccessful attempts during last 24 hours
  const visitorLoginAttemptCountQueryResult =
    await LoginAttempt.findAndCountAll({
      where: {
        visitorId: visitorData.visitorId,
        timestamp: {
          [Sequelize.Op.gt]: new Date().getTime() - 24 * 60 * 1000, // 24 hours
        },
        loginAttemptResult: {
          [Sequelize.Op.not]: loginAttemptResult.Passed,
          [Sequelize.Op.not]: loginAttemptResult.TooManyAttempts,
          [Sequelize.Op.not]: loginAttemptResult.Challenged,
        },
      },
    });

  // Trying credentials, if visitorId performed 5 unsuccessful login attempts during the last 24 hours, do not perform login
  if (visitorLoginAttemptCountQueryResult.count > 4) {
    // Report suspicious user activity according to internal processes here

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
  //#endregion

  //#region Check provided credentials
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
    // Report suspicious user activity according to internal processes here
    await logLoginAttempt(
      visitorData.visitorId,
      userName,
      loginAttemptResult.IncorrectCredentials
    );

    return getForbiddenReponse(res, 'Incorrect credentials, try again.');
  }
  //#endregion
};

// Why we want to check it on server side
async function getVisitorData(visitorId, requestId) {
  // There are different Base URLs for different regions: https://dev.fingerprintjs.com/docs/server-api#regions
  const fingerprintJSProServerApiUrl = new URL(
    `https://api.fpjs.io/visitors/${visitorId}`
  );

  fingerprintJSProServerApiUrl.searchParams.append(
    'api_key',
    'F6gQ8H8vQLc7mVsVKaFx' // In the real world use-case we recommend using Auth-API-Key header instead: https://dev.fingerprintjs.com/docs/server-api#api-methods. Api key should be stored in the environment variables
  );
  fingerprintJSProServerApiUrl.searchParams.append('request_id', requestId);

  const visitorServerApiResponse = await fetch(
    fingerprintJSProServerApiUrl.href
  );

  return await visitorServerApiResponse.json();

  // Alternatively, on the Node.js environment one can use Server API Node.js library: https://github.com/fingerprintjs/fingerprintjs-pro-server-api-node-sdk
  // const client = new FingerprintJsServerApiClient({
  //   region: Region.Global,
  //   apiKey: 'F6gQ8H8vQLc7mVsVKaFx', // In real-world apps api token should be stored in the environment variables
  //   authenticationMode: AuthenticationMode.QueryParameter,
  // });

  // const serverApiFilter = { request_id: requestId };
  // const visitorData = await client.getVisitorHistory(
  //   visitorId,
  //   serverApiFilter
  // );
  // return visitorData;
}

const loginAttemptResult = Object.freeze({
  LowConfidenceScore: 'LowConfidenceScore',
  RequestIdMissmatch: 'RequestIdMissmatch',
  OldTimestamp: 'OldTimestamp',
  TooManyAttempts: 'TooManyAttempts',
  IncorrectCredentials: 'IncorrectCredentials',
  Challenged: 'Challenged',
  Passed: 'Passed',
});

// Dummy action simulating authentication
function areCredentialsCorrect(name, password) {
  return name === mockedUser.userName && password === mockedUser.password;
}

function isLoggingInFromKnownDevice(providedVisitorId, knownVisitorIds) {
  return knownVisitorIds.includes(providedVisitorId);
}

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
