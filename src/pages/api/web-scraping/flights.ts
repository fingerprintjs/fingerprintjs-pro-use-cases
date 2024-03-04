import { NextApiRequest, NextApiResponse } from 'next';
import { Severity } from '../../../server/checkResult';
import { getAndValidateFingerprintResult } from '../../../server/checks';
import { isValidPostRequest } from '../../../server/server';
import { DAY_MS, FIVE_MINUTES_MS, HOUR_MS } from '../../../shared/timeUtils';
import { AIRPORTS } from '../../web-scraping';
import { Flight } from '../../../client/components/web-scraping/FlightCard';
import { saveBotVisit } from '../../../server/botd-firewall/botVisitDatabase';

const roundToFiveMinutes = (time: number) => Math.round(time / FIVE_MINUTES_MS) * FIVE_MINUTES_MS;

export type FlightQuery = {
  from: string;
  to: string;
  requestId: string;
  disableBotDetection: boolean;
};

export type FlightsResponse = {
  message: string;
  severity: Severity;
  data?: Flight[];
};

export default async function getFlights(req: NextApiRequest, res: NextApiResponse<FlightsResponse>) {
  // This API route accepts only POST requests.
  const reqValidation = isValidPostRequest(req);
  if (!reqValidation.okay) {
    res.status(405).send({ severity: 'error', message: reqValidation.error });
    return;
  }

  const { from, to, requestId, disableBotDetection } = req.body as FlightQuery;

  // Get the full Identification and Bot Detection result from Fingerprint Server API and validate its authenticity
  const fingerprintResult = await getAndValidateFingerprintResult(requestId, req);
  if (!fingerprintResult.okay) {
    res.status(403).send({ severity: 'error', message: fingerprintResult.error });
    return;
  }

  const identification = fingerprintResult.data.products?.identification?.data;
  const botData = fingerprintResult.data.products?.botd?.data;

  // Backdoor for demo and testing purposes
  // If bot detection is disabled, just send the result
  if (!botData || disableBotDetection) {
    res
      .status(200)
      .send({ severity: 'success', message: 'Bot detection is disabled.', data: getFlightResults(from, to) });
    return;
  }

  // If a bot is detected, return an error
  if (botData.bot?.result === 'bad') {
    res.status(403).send({
      severity: 'error',
      message: '🤖 Malicious bot detected, access denied.',
    });
    // Optionally, here you could also save the bot's IP address to a blocklist in your database
    // and block all requests from this IP address in the future at a web server/firewall level.
    saveBotVisit(botData, identification?.visitorId ?? 'N/A');
    return;
  }

  // Check for unexpected bot detection value, just in case
  if (!['notDetected', 'good'].includes(botData.bot?.result)) {
    res.status(500).send({
      severity: 'error',
      message: 'Server error, unexpected bot detection value.',
    });
    return;
  }

  // All checks passed, allow access
  res.status(200).send({
    severity: 'success',
    message: 'No malicious bot nor spoofing detected, access allowed.',
    data: getFlightResults(from, to),
  });
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
