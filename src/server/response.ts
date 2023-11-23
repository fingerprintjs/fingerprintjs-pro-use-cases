import { NextApiResponse } from 'next';
import { CheckResult } from './checkResult';

export function sendOkResponse(res: NextApiResponse, result: CheckResult) {
  if (res.headersSent) {
    console.warn('Attempted to send a OK response after headers were sent.', {
      result,
    });

    return;
  }

  return res.status(200).json(result.toJsonResponse());
}

export function sendForbiddenResponse(res: NextApiResponse, result: CheckResult) {
  if (res.headersSent) {
    console.warn('Attempted to send a forbidden response after headers were sent.', {
      result,
    });

    return;
  }

  return res.status(403).json(result.toJsonResponse());
}

export function sendErrorResponse(res: NextApiResponse, result: CheckResult) {
  if (res.headersSent) {
    console.warn('Attempted to send an error response after headers were sent.', {
      result,
    });

    return;
  }

  res.statusMessage = result.message;
  return res.status(500).json(result.toJsonResponse());
}
