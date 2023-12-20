import { FingerprintJsServerApiClient, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { NextApiRequest, NextApiResponse } from 'next';
import { CheckResult, CheckResultObject, checkResultType } from '../../../server/checkResult';
import { isRequestIdFormatValid, originIsAllowed, visitIpMatchesRequestIp } from '../../../server/checks';
import { ALLOWED_REQUEST_TIMESTAMP_DIFF_MS, BACKEND_REGION, SERVER_API_KEY } from '../../../server/const';
import { sendErrorResponse, sendForbiddenResponse, sendOkResponse } from '../../../server/response';
import { ensurePostRequest, messageSeverity } from '../../../server/server';
import { DAY_MS, FIVE_MINUTES_MS, HOUR_MS } from '../../../shared/timeUtils';
import { AIRPORTS } from '../../web-scraping';
import { Flight } from '../../../client/components/web-scraping/FlightCard';
import { saveBotVisit } from '../../../server/botd-firewall/saveBotVisit';
import { EventResponseBotData, EventResponseIdentification } from '../../../shared/types';

const roundToFiveMinutes = (time: number) => Math.round(time / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;

export type FlightQuery = {
  from: string;
  to: string;
  requestId: string;
  disableBotDetection: boolean;
};

export default async function getFlights(req: NextApiRequest, res: NextApiResponse<CheckResultObject<Flight[]>>) {
  // This API route accepts only POST requests.
  if (!ensurePostRequest(req, res)) {
    return;
  }

  const { from, to, requestId, disableBotDetection } = req.body as FlightQuery;

  // Validate request ID format
  if (!isRequestIdFormatValid(requestId)) {
    sendForbiddenResponse(
      res,
      new CheckResult('Invalid request ID.', messageSeverity.Error, checkResultType.RequestIdMismatch),
    );
    return;
  }

  // Retrieve analysis event from the Server API using the request ID
  let botData: EventResponseBotData;
  let identification: EventResponseIdentification;
  try {
    const client = new FingerprintJsServerApiClient({ region: BACKEND_REGION, apiKey: SERVER_API_KEY });
    const eventResponse = await client.getEvent(requestId);
    botData = eventResponse.products?.botd?.data;
    identification = eventResponse.products?.identification?.data;
  } catch (error) {
    console.log(error);
    // Throw a specific error if the request ID is not found
    if (isEventError(error) && error.status === 404) {
      sendForbiddenResponse(
        res,
        new CheckResult(
          'Request ID not found, potential spoofing attack.',
          messageSeverity.Error,
          checkResultType.RequestIdMismatch,
        ),
      );
    } else {
      // Handle other errors
      sendErrorResponse(res, new CheckResult(String(error), messageSeverity.Error, checkResultType.ServerError));
    }
  }

  if (!botData || disableBotDetection) {
    sendOkResponse(
      res,
      new CheckResult(
        'Bot detection is disabled, access allowed.',
        messageSeverity.Success,
        checkResultType.Passed,
        getFlightResults(from, to),
      ),
    );
    return;
  }

  if (botData.bot?.result === 'bad') {
    sendForbiddenResponse(
      res,
      new CheckResult(
        '🤖 Malicious bot detected, access denied.',
        messageSeverity.Error,
        checkResultType.MaliciousBotDetected,
      ),
    );
    // Optionally, here you could also save the bot's IP address to a blocklist in your database
    // and block all requests from this IP address in the future at a web server/firewall level.
    saveBotVisit(botData, identification?.visitorId ?? 'N/A');
    return;
  }

  if (!['notDetected', 'good'].includes(botData.bot?.result)) {
    sendErrorResponse(
      res,
      new CheckResult(
        'Server error, unexpected bot detection value.',
        messageSeverity.Error,
        checkResultType.ServerError,
      ),
    );
    return;
  }

  // We know bot is 'notDetected' or 'good', but
  // we must verify the authenticity of the botDetection result
  // Check if the visit IP matches the request IP
  if (!visitIpMatchesRequestIp(botData.ip, req)) {
    sendForbiddenResponse(
      res,
      new CheckResult('Visit IP does not match request IP.', messageSeverity.Error, checkResultType.IpMismatch),
    );
    return;
  }

  // Check if the visit origin matches the request origin
  if (!originIsAllowed(botData.url, req)) {
    sendForbiddenResponse(
      res,
      new CheckResult(
        'Visit origin does not match request origin or is not allowed.',
        messageSeverity.Error,
        checkResultType.ForeignOrigin,
      ),
    );
    return;
  }

  // Check if the visit timestamp is not old
  if (Date.now() - Number(new Date(botData.time)) > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    sendForbiddenResponse(
      res,
      new CheckResult('Old visit, potential replay attack.', messageSeverity.Error, checkResultType.OldTimestamp),
    );
    return;
  }

  // All checks passed, allow access
  sendOkResponse(
    res,
    new CheckResult(
      'No malicious bot nor spoofing detected, access allowed.',
      messageSeverity.Success,
      checkResultType.Passed,
      getFlightResults(from, to),
    ),
  );
}

/**
 * Randomly generates flight results for given airport codes
 * to simulate the expensive query you are trying to protect from web scraping.
 */
function getFlightResults(fromCode: string, toCode: string): Flight[] {
  if (!AIRPORTS.find((airport) => airport.code === fromCode) || !AIRPORTS.find((airport) => airport.code === toCode)) {
    return [];
  }
  const results: Flight[] = [];
  const airlines = ['United', 'Delta', 'American', 'Southwest', 'Alaska', 'JetBlue'];
  for (const airline of airlines.slice(0, 2 + Math.floor(Math.random() * 4))) {
    const now = Date.now();
    const departureTime = roundToFiveMinutes(now + Math.random() * DAY_MS);
    const arrivalTime = roundToFiveMinutes(departureTime + 3 * HOUR_MS + Math.random() * (DAY_MS / 2));
    const tripLength = roundToFiveMinutes(3 * DAY_MS + Math.random() * DAY_MS);
    const returnDepartureTime = departureTime + tripLength;
    const returnArrivalTime = arrivalTime + tripLength;
    const price = 50 + Math.floor(Math.random() * 400) * 2;
    const flightNumber = `${airline.slice(0, 2).toUpperCase()}${Math.floor(Math.random() * 1000)}`;

    results.push({
      fromCode,
      toCode,
      fromCity: AIRPORTS.find((airport) => airport.code === fromCode)?.city ?? 'City not found',
      toCity: AIRPORTS.find((airport) => airport.code === toCode)?.city ?? 'City not found',
      departureTime,
      arrivalTime,
      returnDepartureTime,
      returnArrivalTime,
      price,
      airline,
      flightNumber,
    });
  }

  return results;
}
