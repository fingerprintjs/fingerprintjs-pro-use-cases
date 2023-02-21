/**
 * @typedef {Object} ResultsQuery
 * @property {string} from
 * @property {string} to
 * @property {string} requestId
 * */

import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { isRequestIdFormatValid, visitIpMatchesRequestIp } from '../../../server/checks';
import { SERVER_API_KEY } from '../../../server/const';
import { ensureGetRequest, getErrorResponse, getForbiddenResponse, getOkResponse, messageSeverity } from '../../../server/server';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // This API route accepts only GET requests.
  if (!ensureGetRequest(req, res)) {
    return;
  }

  console.log(req.query);

  const { from, to, requestId } = /** @type {ResultsQuery} */ (req.query);

  if (!isRequestIdFormatValid(requestId)) {
    getForbiddenResponse(res, 'Invalid request ID', messageSeverity.Error);
  }

  try {
    const client = new FingerprintJsServerApiClient({ region: Region.Global, apiKey: SERVER_API_KEY });
    /** @type {import('@fingerprintjs/fingerprintjs-pro-server-api').EventResponse} */
    const eventResponse = await client.getEvent(requestId);
    const botData = eventResponse.products.botd.data;
    const visitData = eventResponse.products.identification.data;

    if (!visitIpMatchesRequestIp(visitData, req)) {
      getForbiddenResponse(
        res,
        "IP of the fingerprinted visit doesn't match the IP of the request",
        messageSeverity.Error
      );
    }

    if (Date.now() - visitData.timestamp > 3000) {
      console.log(Date.now());
      console.log(visitData.timestamp);
      console.log(Date.now() - visitData.timestamp);
      console.log('Request is too old, potential replay attack');
      getForbiddenResponse(res, 'Old request, potential replay attack', messageSeverity.Error);
    }

    if (botData.bot.result === 'bad') {
      getForbiddenResponse(res, 'Malicious bot detected', messageSeverity.Error);
    }
    if (botData.bot.result === 'good' || botData.bot.result === 'notDetected') {
      getOkResponse(res, 'A good bot or human visitor', messageSeverity.Success, { flights: ['LAX', 'SFO', 'JF'] });
    }
  } catch (error) {
    console.error(error);
    getErrorResponse(res, `Server error: ${error.message}`)
  }

  res.status(200).json({ name: 'John Doe' });
}
