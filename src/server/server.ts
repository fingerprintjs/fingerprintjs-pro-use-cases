import { Sequelize } from 'sequelize';
import { areVisitorIdAndRequestIdValid } from './checks';
import { fingerprintJsApiClient } from './fingerprint-api';
import { CheckResult, checkResultType } from './checkResult';
import { sendForbiddenResponse } from './response';
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationResult } from '../shared/types';

// Provision the database.
// In the Stackblitz environment, this db is stored locally in your browser.
// On the deployed demo, db is cleaned after each deployment.
export const sequelize = new Sequelize('database', '', '', {
  dialect: 'sqlite',
  storage: '.data/database.sqlite',
  logging: false,
});

export const messageSeverity = Object.freeze({
  Success: 'success',
  Warning: 'warning',
  Error: 'error',
});

export function ensureValidRequestIdAndVisitorId(
  req: NextApiRequest,
  res: NextApiResponse,
  visitorId: string,
  requestId: string,
) {
  if (!areVisitorIdAndRequestIdValid(visitorId, requestId)) {
    reportSuspiciousActivity(req);
    sendForbiddenResponse(
      res,
      new CheckResult(
        'Forged visitorId or requestId detected. Try harder next time.',
        messageSeverity.Error,
        checkResultType.RequestIdMismatch,
      ),
    );

    return false;
  }

  return true;
}

// Every identification request should be validated using the Fingerprint Pro Server API.

export async function getIdentificationEvent(requestId?: string) {
  // Do not request Server API if provided data is obviously forged,
  // throw an error instead.
  if (!requestId) {
    throw new Error('requestId not provided.');
  }

  // Use Fingerprint Node SDK get the identification event from the Server API.
  return fingerprintJsApiClient.getEvent(requestId);
}

// Report suspicious user activity according to internal processes here.
// Possibly this action could also lock the user's account temporarily or ban a specific action.
export function reportSuspiciousActivity(_context: any) {
  return _context;
}

export function ensurePostRequest(req: NextApiRequest, res: NextApiResponse): boolean {
  const validation = isValidPostRequest(req);
  if (!validation.okay) {
    res.status(405).send({ message: validation.error });
    return false;
  }

  return true;
}

export function ensureGetRequest(req: NextApiRequest, res: NextApiResponse): boolean {
  if (req.method !== 'GET') {
    res.status(405).send({ message: 'Only GET requests allowed' });
    return false;
  }

  return true;
}

export const isValidPostRequest = (req: NextApiRequest): ValidationResult => {
  if (req.method !== 'POST') {
    return { okay: false, error: 'Only POST requests allowed' };
  }
  if (!req.body) {
    return { okay: false, error: 'Missing body' };
  }
  return { okay: true };
};
