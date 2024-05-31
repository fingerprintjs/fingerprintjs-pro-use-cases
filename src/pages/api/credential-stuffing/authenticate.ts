import { Op } from 'sequelize';
import { isValidPostRequest, sequelize } from '../../../server/server';
import { Severity, getAndValidateFingerprintResult } from '../../../server/checks';
import { NextApiRequest, NextApiResponse } from 'next';
import { CREDENTIAL_STUFFING_COPY } from '../../../server/credentialStuffing/copy';
import { env } from '../../../env';
import { LoginAttemptDbModel, LoginAttemptResult } from '../../../server/credentialStuffing/database';

export type LoginPayload = {
  username: string;
  password: string;
  requestId: string;
  visitorId: string;
};

export type LoginResponse = {
  message: string;
  severity: Severity;
};

// Mocked user with leaked credentials associated with visitorIds.
const mockedUser = {
  userName: 'user',
  password: 'password',
  knownVisitorIds: getKnownVisitorIds(),
};

function getKnownVisitorIds() {
  const defaultVisitorIds = ['bXbwuhCBRB9lLTK692vw', 'ABvLgKyH3fAr6uAjn0vq', 'BNvLgKyHefAr9iOjn0ul'];
  const visitorIdsFromEnv = env.KNOWN_VISITOR_IDS?.split(',');
  console.info(`Extracted ${visitorIdsFromEnv?.length ?? 0} visitorIds from env.`);
  return visitorIdsFromEnv ? [...defaultVisitorIds, ...visitorIdsFromEnv] : defaultVisitorIds;
}

export default async function loginHandler(req: NextApiRequest, res: NextApiResponse) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { requestId, username, password, visitorId: clientVisitorId } = req.body as LoginPayload;

  // Get the full Identification result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult({ requestId, req });
  if (!fingerprintResult.okay) {
    logLoginAttempt(clientVisitorId, username, 'RequestIdValidationFailed');
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  // Get visitorId from the Server API Identification event
  const visitorId = fingerprintResult.data.products?.identification?.data?.visitorId;
  if (!visitorId) {
    logLoginAttempt(clientVisitorId, username, 'RequestIdValidationFailed');
    res.status(403).send({ severity: 'error', message: 'Visitor ID not found.' });
    return;
  }

  // If the visitor ID performed 5 unsuccessful login attempts during the last 24 hours we do not perform the login.
  const failedLoginTypes: LoginAttemptResult[] = ['IncorrectCredentials', 'RequestIdValidationFailed'];
  const failedLoginsToday = await LoginAttemptDbModel.findAndCountAll({
    where: {
      visitorId,
      timestamp: {
        [Op.gt]: new Date().getTime() - 24 * 60 * 1000,
      },
      loginAttemptResult: {
        [Op.or]: [failedLoginTypes],
      },
    },
  });
  if (failedLoginsToday.count >= 5) {
    logLoginAttempt(visitorId, username, 'TooManyLoginAttempts');
    res.status(403).send({ severity: 'error', message: CREDENTIAL_STUFFING_COPY.tooManyAttempts });
    return;
  }

  // If the provided credentials are incorrect, we return an error.
  if (!credentialsAreCorrect(username, password)) {
    logLoginAttempt(visitorId, username, 'IncorrectCredentials');
    res.status(403).send({ severity: 'error', message: CREDENTIAL_STUFFING_COPY.invalidCredentials });
    return;
  }

  // If the provided credentials are correct but the user never logged in using this browser,
  // we force the user to use multi-factor authentication (text message, email, authenticator app, etc.)
  if (!mockedUser.knownVisitorIds.includes(visitorId)) {
    logLoginAttempt(visitorId, username, 'UnknownBrowserEnforceMFA');
    res.status(403).send({ severity: 'warning', message: CREDENTIAL_STUFFING_COPY.differentVisitorIdUseMFA });
    return;
  }

  // If the provided credentials are correct and we recognize the browser, we log the user in
  logLoginAttempt(visitorId, username, 'Success');
  res.status(200).send({ severity: 'success', message: CREDENTIAL_STUFFING_COPY.success });
}

// Dummy action simulating authentication.
function credentialsAreCorrect(name: string, password: string): boolean {
  return name === mockedUser.userName && password === mockedUser.password;
}

// Persists login attempt to the database.
async function logLoginAttempt(visitorId: string, username: string, loginAttemptResult: LoginAttemptResult) {
  await LoginAttemptDbModel.create({
    visitorId,
    username,
    loginAttemptResult,
    timestamp: new Date(),
  });
  await sequelize.sync();
}
