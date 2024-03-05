import { EventResponse, FingerprintJsServerApiClient, isEventError } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { CheckResult, checkResultType } from './checkResult';
import {
  ALLOWED_REQUEST_TIMESTAMP_DIFF_MS,
  BACKEND_REGION,
  IPv4_REGEX,
  MIN_CONFIDENCE_SCORE,
  SERVER_API_KEY,
} from './const';
import { messageSeverity, ourOrigins } from './server';
import { NextApiRequest, NextApiResponse } from 'next';
import { ValidationDataResult } from '../shared/types';

// Validates format of visitorId and requestId.
export const isVisitorIdFormatValid = (visitorId: string) => /^[a-zA-Z0-9]{20}$/.test(visitorId);
export const isRequestIdFormatValid = (requestId: string) => /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
export function areVisitorIdAndRequestIdValid(visitorId: string, requestId: string) {
  return isRequestIdFormatValid(requestId) && isVisitorIdFormatValid(visitorId);
}

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export type RequestCallback = (req: NextApiRequest, res: NextApiResponse, visitorData: EventResponse) => void;

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export type RuleCheck = (
  eventResponse: EventResponse,
  req: NextApiRequest,
  ...args: any
) => (CheckResult | undefined) | Promise<CheckResult | undefined>;

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkFreshIdentificationRequest: RuleCheck = (eventResponse) => {
  const timestamp = eventResponse?.products?.identification?.data?.timestamp;
  if (!eventResponse || !timestamp) {
    return new CheckResult(
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no sensitive action was performed.',
      messageSeverity.Error,
      checkResultType.RequestIdMismatch,
    );
  }

  const requestTimestampDiff = new Date().getTime() - timestamp;

  if (requestTimestampDiff > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return new CheckResult(
      'Old requestId detected. Action ignored and logged.',
      messageSeverity.Error,
      checkResultType.OldTimestamp,
    );
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkConfidenceScore: RuleCheck = (eventResponse) => {
  const confidenceScore = eventResponse?.products?.identification?.data?.confidence.score;
  if (!confidenceScore || confidenceScore < MIN_CONFIDENCE_SCORE) {
    return new CheckResult(
      "Low confidence score, we'd rather verify you with the second factor,",
      messageSeverity.Error,
      checkResultType.LowConfidenceScore,
    );
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkIpAddressIntegrity: RuleCheck = (eventResponse, request) => {
  if (!visitIpMatchesRequestIp(eventResponse.products?.identification?.data?.ip, request)) {
    return new CheckResult(
      'IP mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.IpMismatch,
    );
  }

  return undefined;
};

/**
 * @deprecated Use getAndValidateFingerprintResult() for new use cases
 */
export const checkOriginsIntegrity: RuleCheck = (eventResponse, request) => {
  if (!originIsAllowed(eventResponse.products?.identification?.data?.url, request)) {
    return new CheckResult(
      'Origin mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.ForeignOrigin,
    );
  }

  return undefined;
};

export function visitIpMatchesRequestIp(visitIp = '', request: NextApiRequest) {
  // This check is skipped on purpose in the Stackblitz and localhost environments.
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  /**
   * Parsing the user IP from `x-forwarded-for` can be unreliable as any proxy between your server
   * and the visitor can overwrite or spoof the header. In most cases, using the right-most external
   * IP is more appropriate than the left-most one as is demonstrated here.
   * You might need to adjust or skip this check depending on your use case and server configuration.
   * You can learn more at:
   * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
   * https://adam-p.ca/blog/2022/03/x-forwarded-for/.
   */
  const xForwardedFor = request.headers['x-forwarded-for'];
  const requestIp = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor?.split(',')[0] ?? '';

  // IPv6 addresses are not supported yet, skip the check
  if (!IPv4_REGEX.test(requestIp)) {
    return true;
  }

  return requestIp === visitIp;
}

export function originIsAllowed(url = '', request: NextApiRequest) {
  // This check is skipped on purpose in the Stackblitz and localhost environments.
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const visitDataOrigin = new URL(url).origin;
  return (
    visitDataOrigin === request.headers['origin'] &&
    ourOrigins.includes(visitDataOrigin) &&
    ourOrigins.includes(request.headers['origin'])
  );
}

/**
 * Retrieves the full Identification event from the Server API and validates its authenticity.
 */
export const getAndValidateFingerprintResult = async (
  requestId: string,
  req: NextApiRequest,
): Promise<ValidationDataResult<EventResponse>> => {
  // Request ID must match the expected format
  if (!isRequestIdFormatValid(requestId)) {
    return { okay: false, error: 'Invalid request ID format.' };
  }

  /**
   * The Server API must contain information about this specific identification request.
   * If not, the request might have been tampered with and we don't trust this identification attempt.
   * The Server API also allows you to access all available [Smart Signals](https://dev.fingerprint.com/docs/smart-signals-overview)
   */
  let identificationEvent: EventResponse;
  try {
    const client = new FingerprintJsServerApiClient({ region: BACKEND_REGION, apiKey: SERVER_API_KEY });
    const eventResponse = await client.getEvent(requestId);
    identificationEvent = eventResponse;
  } catch (error) {
    console.error(error);
    // Throw a specific error if the request ID is not found
    if (isEventError(error) && error.status === 404) {
      return { okay: false, error: 'Request ID not found, potential spoofing attack.' };
    }
    return { okay: false, error: String(error) };
  }

  // Identification event must contain identification data
  const identification = identificationEvent.products?.identification?.data;
  if (!identification) {
    return { okay: false, error: 'Identification data not found, potential spoofing attack.' };
  }

  // The client request must come from the same IP address as the identification request.
  if (!visitIpMatchesRequestIp(identification?.ip, req)) {
    return { okay: false, error: 'Identification IP does not match request IP, potential spoofing attack.' };
  }

  /**
   * The client request must come from an expected origin (usually your website)
   * and its origin must match the identification request origin
   */
  if (!originIsAllowed(identification.url, req)) {
    return { okay: false, error: 'Visit origin does not match request origin, potential spoofing attack.' };
  }

  /**
   * The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
   * If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
   * More info: https://dev.fingerprint.com/docs/understanding-your-confidence-score
   */
  if (identification.confidence.score < MIN_CONFIDENCE_SCORE) {
    return { okay: false, error: 'Identification confidence score too low, potential spoofing attack.' };
  }

  /**
   * An attacker might have acquired a valid requestId and visitorId via phishing.
   * It's recommended to check freshness of the identification request to prevent replay attacks.
   */
  if (Date.now() - Number(new Date(identification.time)) > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return { okay: false, error: 'Old identification request, potential replay attack.' };
  }

  // All checks passed, we can trust this identification event
  return { okay: true, data: identificationEvent };
};
