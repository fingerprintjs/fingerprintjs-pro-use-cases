import { isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { fingerprintServerApiClient } from '../../../server/fingerprint-server-api';
import Cors from 'cors';
import { OUR_ORIGINS } from '../../../server/checks';
import { IS_PRODUCTION } from '../../../envShared';

// Also allow our documentation to use the endpoint
const allowedOrigins = [...OUR_ORIGINS, 'https://dev.fingerprint.com'];

// We need to set up CORS for that  https://github.com/expressjs/cors#configuration-options
const cors = Cors({
  methods: ['POST', 'HEAD'],
  origin: allowedOrigins,
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
// https://github.com/vercel/next.js/blob/canary/examples/api-routes-cors/pages/api/cors.ts
function runMiddleware(req: NextApiRequest, res: NextApiResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default async function getFingerprintEvent(req: NextApiRequest, res: NextApiResponse) {
  // Run the CORS middleware
  await runMiddleware(req, res, cors);

  /**
   * In production, it's a good idea to validate the origin of the request,
   * since this endpoint exposes the underlying authenticated Fingerprint Server API endpoint.
   * It's just an extra precaution, you should primarily be using [Request filtering](https://dev.fingerprint.com/docs/request-filtering)
   * to protect your Public API key from unauthorized usage.
   */
  const origin = req.headers['origin'] as string;
  if (IS_PRODUCTION && !allowedOrigins.includes(origin)) {
    res.status(403).send({ message: `Origin ${origin} is not allowed to call this endpoint` });
    return;
  }

  const { requestId } = req.query as { requestId: string };
  return await tryGetFingerprintEvent(res, requestId);
}

/**
 * It's possible the data about the specific event is not propagated to the Server API yet. This function retries for Not Found (404) requests.
 * */
async function tryGetFingerprintEvent(
  res: NextApiResponse,
  requestId: string,
  retryCount = 5,
  retryDelay: number = 3000,
) {
  try {
    const eventResponse = await fingerprintServerApiClient.getEvent(requestId);
    res.status(200).json(eventResponse);
  } catch (error) {
    // Retry only Not Found (404) requests.
    if (isEventError(error) && error.status === 404 && retryCount > 1) {
      setTimeout(() => tryGetFingerprintEvent(res, requestId, retryCount - 1, retryDelay), retryDelay);
    } else {
      console.error(error);
      sendErrorResponse(res, error);
    }
  }
}

function sendErrorResponse(res: NextApiResponse, error: unknown) {
  if (isEventError(error)) {
    res.statusMessage = `${error.error?.code} - ${error.error?.message}`;
    res.status(error.status).json({
      message: error.error?.message,
      code: error.error?.code,
    });
  } else {
    res.statusMessage = `Something went wrong ${error}`;
    res.status(500).end();
  }
}
