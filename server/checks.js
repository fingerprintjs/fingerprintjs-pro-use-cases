import { CheckResult, checkResultType } from './checkResult';
import { ALLOWED_REQUEST_TIMESTAMP_DIFF_MS, IPv4_REGEX, MIN_CONFIDENCE_SCORE } from './const';
import { messageSeverity, ourOrigins } from './server';

// Validates format of visitorId and requestId.
export const isVisitorIdFormatValid = (visitorId) => /^[a-zA-Z0-9]{20}$/.test(visitorId);
export const isRequestIdFormatValid = (requestId) => /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
export function areVisitorIdAndRequestIdValid(visitorId, requestId) {
  return isRequestIdFormatValid(requestId) && isVisitorIdFormatValid(visitorId);
}

export function checkFreshIdentificationRequest(visitorData) {
  // The Server API must contain information about this specific identification request.
  // If not, the request might have been tampered with and we don't trust this identification attempt.
  if (visitorData.error || visitorData.visits.length !== 1) {
    return new CheckResult(
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no sensitive action was performed.',
      messageSeverity.Error,
      checkResultType.RequestIdMismatch
    );
  }

  // An attacker might have acquired a valid requestId and visitorId via phishing.
  // It's recommended to check freshness of the identification request to prevent replay attacks.
  const requestTimestampDiff = new Date().getTime() - visitorData.visits[0].timestamp;

  if (requestTimestampDiff > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return new CheckResult(
      'Old requestId detected. Action ignored and logged.',
      messageSeverity.Error,
      checkResultType.OldTimestamp
    );
  }
}

// The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
// If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
// More info: https://dev.fingerprint.com/docs/understanding-your-confidence-score
export function checkConfidenceScore(visitorData) {
  if (visitorData.visits[0].confidence.score < MIN_CONFIDENCE_SCORE) {
    return new CheckResult(
      "Low confidence score, we'd rather verify you with the second factor,",
      messageSeverity.Error,
      checkResultType.LowConfidenceScore
    );
  }
}

// Checks if the authentication request comes from the same IP address as the identification request.
export function checkIpAddressIntegrity(visitorData, request) {
  if (!visitIpMatchesRequestIp(visitorData.visits[0].ip, request)) {
    return new CheckResult(
      'IP mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.IpMismatch
    );
  }
}

/**
 *
 * @param {string} visitIp
 * @param {import('http').IncomingMessage} request
 * @returns {boolean}
 */
export function visitIpMatchesRequestIp(visitIp = '', request) {
  // This check is skipped on purpose in the Stackblitz and localhost environments.
  if (process.env.NODE_ENV === 'development') {
    return true;
  }

  const requestIp = /** @type {string} */ (request.headers['x-forwarded-for'])?.split(',')[0] ?? '';

  // IPv6 addresses are not supported yet, skip the check
  if (!IPv4_REGEX.test(requestIp)) {
    return true;
  }

  return requestIp === visitIp;
}

// Checks if the authentication request comes from a known origin and
// if the authentication request's origin corresponds to the origin/URL provided by the Fingerprint Pro Server API.
// Additionally, one should set Request Filtering settings in the dashboard: https://dev.fingerprint.com/docs/request-filtering
export function checkOriginsIntegrity(visitorData, request) {
  if (!originIsAllowed(visitorData.visits[0].url, request)) {
    return new CheckResult(
      'Origin mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.ForeignOrigin
    );
  }
}

/**
 *
 * @param {string} url
 * @param {import('http').IncomingMessage} request
 * @returns {boolean}
 */
export function originIsAllowed(url = '', request) {
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
