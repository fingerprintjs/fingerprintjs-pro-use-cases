import { FingerprintJsServerApiClient, Region } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { CheckResult, checkResultType } from '../../../server/checkResult';
import { isRequestIdFormatValid, originIsAllowed, visitIpMatchesRequestIp } from '../../../server/checks';
import {
  ALLOWED_REQUEST_TIMESTAMP_DIFF_MS,
  DAY_MS,
  FIVE_MINUTES_MS,
  HOUR_MS,
  SERVER_API_KEY,
} from '../../../server/const';
import { sendErrorResponse, sendForbiddenResponse, sendOkResponse } from '../../../server/response';
import { ensureGetRequest, messageSeverity } from '../../../server/server';
import { AIRPORTS } from '../../web-scraping';

/**
 * @typedef {Object} ResultsQuery
 * @property {string} from
 * @property {string} to
 * @property {string} requestId
 * */

/**
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function getFlights(req, res) {
  // This API route accepts only GET requests.
  if (!ensureGetRequest(req, res)) {
    return;
  }

  const { from, to, requestId } = /** @type {ResultsQuery} */ (req.query);

  // Validate request ID format
  if (!isRequestIdFormatValid(requestId)) {
    sendForbiddenResponse(
      res,
      new CheckResult('Invalid request ID.', messageSeverity.Error, checkResultType.RequestIdMismatch)
    );
    return;
  }

  try {
    // Retrieve analysis event from the Server API using the request ID
    const client = new FingerprintJsServerApiClient({ region: Region.Global, apiKey: SERVER_API_KEY });
    // If the requestId does not exist, the SDK will throw an error which will be caught below
    const eventResponse = await client.getEvent(requestId);
    const botData = eventResponse.products.botd?.data; // undefined if bot is not detected
    const visitData = eventResponse.products.identification?.data; // undefined if bot is detected

    // Check for bot presence and type
    if (botData?.bot?.result === 'bad') {
      sendForbiddenResponse(
        res,
        new CheckResult(
          '🤖 Malicious bot detected, access denied.',
          messageSeverity.Error,
          checkResultType.MaliciousBotDetected
        )
      );
      return;
    }

    if (botData?.bot?.result === 'good') {
      sendOkResponse(
        res,
        new CheckResult(
          'A good bot detected, access allowed.',
          messageSeverity.Success,
          checkResultType.GoodBotDetected,
          getFlightResults(from, to)
        )
      );
      return;
    }

    // Bot not detected, verify the visit data
    // Check if the visit IP matches the request IP
    if (!visitIpMatchesRequestIp(visitData, req)) {
      sendForbiddenResponse(
        res,
        new CheckResult('Visit IP does not match request IP.', messageSeverity.Error, checkResultType.IpMismatch)
      );
      return;
    }

    // Check if the visit origin matches the request origin
    if (!originIsAllowed(visitData, req)) {
      sendForbiddenResponse(
        res,
        new CheckResult(
          'Visit origin does not match request origin or is not allowed.',
          messageSeverity.Error,
          checkResultType.ForeignOrigin
        )
      );
      return;
    }

    // Check if the visit timestamp is not old
    if (Date.now() - visitData.timestamp > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
      sendForbiddenResponse(
        res,
        new CheckResult('Old visit, potential replay attack.', messageSeverity.Error, checkResultType.OldTimestamp)
      );
      return;
    }

    // All checks passed, allow access
    sendOkResponse(
      res,
      new CheckResult(
        'No bot detected, access allowed.',
        messageSeverity.Success,
        messageSeverity.Success,
        getFlightResults(from, to)
      )
    );
  } catch (error) {
    console.log(error);
    // Throw a specific error if the request ID is not found
    if (error.status === 404) {
      sendForbiddenResponse(
        res,
        new CheckResult(
          'Request ID not found, potential spoofing attack.',
          messageSeverity.Error,
          checkResultType.RequestIdMismatch
        )
      );
    } else {
      // Handle other errors
      sendErrorResponse(
        res,
        new CheckResult(`Server error: ${error}`, messageSeverity.Error, checkResultType.ServerError)
      );
    }
  }
}

/**
 * @typedef {import('../../../client/components/web-scraping/FlightCard').Flight} Flight
 */

/**
 * Randomly generates flight results for given airports
 * to simulate the expensive computation you are trying to protect from web scraping.
 * @param {string} fromCode
 * @param {string} toCode
 * @returns {Flight[]}
 */
function getFlightResults(fromCode, toCode) {
  const results = [];
  const airlines = ['United', 'Delta', 'American', 'Southwest', 'Alaska', 'JetBlue'];
  for (const airline of airlines.slice(0, 2 + Math.floor(Math.random() * 4))) {
    const now = Date.now();
    const departureTime = Math.round((now + Math.random() * DAY_MS) / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
    const arrivalTime =
      Math.round((departureTime + 3 * HOUR_MS + Math.random() * (DAY_MS / 2)) / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;
    const price = Math.floor(Math.random() * 1000);
    const flightNumber = `${airline.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

    results.push({
      fromCode,
      toCode,
      fromCity: AIRPORTS.find((airport) => airport.code === fromCode).city,
      toCity: AIRPORTS.find((airport) => airport.code === toCode).city,
      departureTime,
      arrivalTime,
      price,
      airline,
      flightNumber,
    });
  }

  return results;
}
