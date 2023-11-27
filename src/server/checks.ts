import { VisitorsResponse } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { CheckResult, checkResultType } from './checkResult';
import { ALLOWED_REQUEST_TIMESTAMP_DIFF_MS, IPv4_REGEX, MIN_CONFIDENCE_SCORE } from './const';
import { messageSeverity, ourOrigins } from './server';
import { NextApiRequest, NextApiResponse } from 'next';

// Validates format of visitorId and requestId.
export const isVisitorIdFormatValid = (visitorId: string) => /^[a-zA-Z0-9]{20}$/.test(visitorId);
export const isRequestIdFormatValid = (requestId: string) => /^\d{13}\.[a-zA-Z0-9]{6}$/.test(requestId);
export function areVisitorIdAndRequestIdValid(visitorId: string, requestId: string) {
  return isRequestIdFormatValid(requestId) && isVisitorIdFormatValid(visitorId);
}

export type RequestCallback = (req: NextApiRequest, res: NextApiResponse, visitorData: VisitorsResponse) => void;

export type RuleCheck = (
  visitorData: VisitorsResponse,
  req: NextApiRequest,
  ...args: any
) => (CheckResult | undefined) | Promise<CheckResult | undefined>;

export const checkFreshIdentificationRequest: RuleCheck = (visitorData: VisitorsResponse) => {
  // The Server API must contain information about this specific identification request.
  // If not, the request might have been tampered with and we don't trust this identification attempt.
  if (!visitorData.visits || visitorData.visits.length !== 1) {
    return new CheckResult(
      'Hmmm, sneaky trying to forge information from the client-side, no luck this time, no sensitive action was performed.',
      messageSeverity.Error,
      checkResultType.RequestIdMismatch,
    );
  }

  // An attacker might have acquired a valid requestId and visitorId via phishing.
  // It's recommended to check freshness of the identification request to prevent replay attacks.
  const requestTimestampDiff = new Date().getTime() - visitorData.visits[0].timestamp;

  if (requestTimestampDiff > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS) {
    return new CheckResult(
      'Old requestId detected. Action ignored and logged.',
      messageSeverity.Error,
      checkResultType.OldTimestamp,
    );
  }
};

// The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
// If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
// More info: https://dev.fingerprint.com/docs/understanding-your-confidence-score
export const checkConfidenceScore: RuleCheck = (visitorData) => {
  if (visitorData?.visits[0]?.confidence?.score < MIN_CONFIDENCE_SCORE) {
    return new CheckResult(
      "Low confidence score, we'd rather verify you with the second factor,",
      messageSeverity.Error,
      checkResultType.LowConfidenceScore,
    );
  }
};

// Checks if the authentication request comes from the same IP address as the identification request.
export const checkIpAddressIntegrity: RuleCheck = (visitorData, request) => {
  if (!visitIpMatchesRequestIp(visitorData.visits[0].ip, request)) {
    return new CheckResult(
      'IP mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.IpMismatch,
    );
  }
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

// Checks if the authentication request comes from a known origin and
// if the authentication request's origin corresponds to the origin/URL provided by the Fingerprint Pro Server API.
// Additionally, one should set Request Filtering settings in the dashboard: https://dev.fingerprint.com/docs/request-filtering
export const checkOriginsIntegrity: RuleCheck = (visitorData, request) => {
  if (!originIsAllowed(visitorData.visits[0].url, request)) {
    return new CheckResult(
      'Origin mismatch. An attacker might have tried to phish the victim.',
      messageSeverity.Error,
      checkResultType.ForeignOrigin,
    );
  }
};

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
