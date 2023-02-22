/**
 * @typedef {Object} ResultsQuery
 * @property {string} from
 * @property {string} to
 * @property {string} requestId
 * */

import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { isRequestIdFormatValid, originIsAllowed, visitIpMatchesRequestIp } from '../../../server/checks';
import { SERVER_API_KEY } from '../../../server/const';
import {
  ensureGetRequest,
  getErrorResponse,
  getForbiddenResponse,
  getOkResponse,
  messageSeverity,
} from '../../../server/server';

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // This API route accepts only GET requests.
  if (!ensureGetRequest(req, res)) {
    return;
  }

  const { from, to, requestId } = /** @type {ResultsQuery} */ (req.query);

  // Validate request ID format
  if (!isRequestIdFormatValid(requestId)) {
    getForbiddenResponse(res, 'Invalid request ID', messageSeverity.Error);
    return;
  }

  try {
    // Retrieve analysis event from the Server API using the request ID
    const client = new FingerprintJsServerApiClient({ region: Region.Global, apiKey: SERVER_API_KEY });
    const eventResponse = await client.getEvent(requestId);

    if (!eventResponse) {
      getForbiddenResponse(res, 'Request ID not found, potential spoofing attack.', messageSeverity.Error);
      return;
    }

    const botData = eventResponse.products.botd?.data; // undefined if bot is not detected
    const visitData = eventResponse.products.identification?.data; // undefined if bot is detected

    // Check for bot presence and type
    if (botData.bot?.result === 'bad') {
      getForbiddenResponse(res, 'Malicious bot detected, access denied.', messageSeverity.Error);
      return;
    }

    if (botData.bot?.result === 'good') {
      getOkResponse(res, 'A good bot detected, access allowed.', messageSeverity.Success, {
        flights: ['LAX', 'SFO', 'JF'],
      });
      return;
    }

    // Bot not detected, we can use the identification visitData
    if (!visitIpMatchesRequestIp(visitData, req)) {
      getForbiddenResponse(res, 'Visit IP does not match request IP.', messageSeverity.Error);
      return;
    }

    if (!originIsAllowed(visitData, req)) {
      getForbiddenResponse(res, 'Visit origin does not match request origin or is not allowed.', messageSeverity.Error);
      return;
    }

    if (Date.now() - visitData.timestamp > 3000) {
      getForbiddenResponse(res, 'Old request, potential replay attack.', messageSeverity.Error);
      return;
    }

    // All checks passed, allow access
    getOkResponse(res, 'No bot detected, all seems fine, access allowed.', messageSeverity.Success, {
      flights: getFlightResults(from, to),
    });
  } catch (error) {
    console.error(error);
    getErrorResponse(res, `Server error: ${error.message}`);
  }
}

/** @typedef Flight 
 * @property {string} from
 * @property {string} to
 * @property {number} departureTime
 * @property {number} arrivalTime
 * @property {number} price
 * @property {string} airline
 * @property {string} flightNumber
*/


const DAY_MS = 1000 * 60 * 60 * 24;
const FIVE_MINUTES_MS = 1000 * 60 * 5;

// Add random time to now between 2 and 24 hours in 5 minute increments
const getRandomTime = () => {
  const now = Date.now();
  const randomTime = now + Math.round(Math.random() * DAY_MS);
  return Math.round(randomTime / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
};

/**
 * Randomly generates flight results for given from/to airports
 * @param {string} from
 * @param {string} to
 * @returns {Flight[]}
 */
const getFlightResults = (from, to) => {
  const results = [];
  const airlines = ['United', 'Delta', 'American', 'Southwest', 'Alaska', 'JetBlue'];
  for (const airline of airlines.slice(0, 2 + Math.floor(Math.random() * 4))) {
    const now = Date.now();
    const departureTime = Math.round((now + Math.random() * DAY_MS) / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
    const arrivalTime = Math.round((departureTime + Math.random() * DAY_MS) / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
    const price = Math.floor(Math.random() * 1000);
    const flightNumber = `${airline.slice(0,2).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

    results.push({
      from,
      to,
      departureTime,
      arrivalTime,
      price,
      airline,
      flightNumber,
    });
  }

  return results;
}
