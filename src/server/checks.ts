import { Event, FingerprintServerApiClient, Region, RequestError } from '@fingerprint/node-sdk';
import { isIPv6 } from 'is-ip';
import { ValidationDataResult } from '../utils/types';
import { decryptSealedResult } from './decryptSealedResult';
import { env } from '../env';
import { getServerRegion } from './fingerprint-server-api';
import { IS_DEVELOPMENT } from '../envShared';

export const IPv4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/;
export const ALLOWED_REQUEST_TIMESTAMP_DIFF_MS = 7000;

// Demo origins.
// It is recommended to use production origins instead.
export const OUR_ORIGINS = [
  'https://fingerprinthub.com',
  'https://demo.fingerprint.com',
  'https://localhost:3000',
  'http://localhost:3000',
  'https://staging.fingerprinthub.com',
];

export type Severity = 'success' | 'warning' | 'error';

// Validates format of visitorId and eventId.
export const isVisitorIdFormatValid = (visitorId: string) => /^[a-zA-Z0-9]{20}$/.test(visitorId);
export const isEventIdFormatValid = (eventId: string) => /^\d{13}\.[a-zA-Z0-9]{6}$/.test(eventId);
export function areVisitorIdAndEventIdValid(visitorId: string, eventId: string) {
  return isEventIdFormatValid(eventId) && isVisitorIdFormatValid(visitorId);
}

/**
 * Client IP from X-Forwarded-For, skipping `trustedProxyCount` hops from the right.
 *
 * CDNs and load balancers append the connecting IP; they do not replace a client-supplied list.
 * The left-most value is therefore attacker-controlled. Never use it.
 *
 * demo.fingerprint.com is CloudFront → Digital Ocean App Platform, so trustedProxyCount is 1:
 *   client, <digital-ocean-hop>
 * A spoofed request looks like:
 *   <spoof>, client, <digital-ocean-hop>
 *
 * If your edge overwrites a header (CloudFront-Viewer-Address, CF-Connecting-IP), prefer that instead of XFF.
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Forwarded-For
 * https://adam-p.ca/blog/2022/03/x-forwarded-for/
 */
export function clientIpFromXForwardedFor(xForwardedFor: string | null, trustedProxyCount: number): string | undefined {
  if (!xForwardedFor) {
    return undefined;
  }

  const hops = xForwardedFor
    .split(',')
    .map((hop) => hop.trim())
    .filter((hop) => hop.length > 0);
  const clientIndex = hops.length - trustedProxyCount - 1;
  if (clientIndex < 0) {
    return undefined;
  }

  return hops[clientIndex];
}

function logXForwardedForHops(request: Request) {
  // Temporary: confirm hop count on staging.fingerprinthub.com, then remove.
  const xForwardedFor = request.headers.get('x-forwarded-for');
  const hops =
    xForwardedFor
      ?.split(',')
      .map((hop) => hop.trim())
      .filter((hop) => hop.length > 0) ?? [];
  console.info('[xff-hops]', {
    host: request.headers.get('host'),
    hopCount: hops.length,
    hops,
    trustedProxyCount: env.TRUSTED_PROXY_COUNT,
    derivedClientIp: clientIpFromXForwardedFor(xForwardedFor, env.TRUSTED_PROXY_COUNT),
    cloudfrontViewerAddress: request.headers.get('cloudfront-viewer-address'),
    cfConnectingIp: request.headers.get('cf-connecting-ip'),
    xRealIp: request.headers.get('x-real-ip'),
    trueClientIp: request.headers.get('true-client-ip'),
  });
}

export function visitIpMatchesRequestIp(visitIp = '', request: Request, trustedProxyCount = env.TRUSTED_PROXY_COUNT) {
  // This check is skipped on purpose in localhost environments.
  if (IS_DEVELOPMENT) {
    return true;
  }

  const requestIp = clientIpFromXForwardedFor(request.headers.get('x-forwarded-for'), trustedProxyCount);

  // Fail closed when the client IP cannot be derived from a trusted hop.
  if (!requestIp) {
    return false;
  }

  // IPv6 is not compared yet (event IP and request IP can disagree on v4 vs v6).
  if (isIPv6(requestIp) || isIPv6(visitIp)) {
    return true;
  }

  if (!IPv4_REGEX.test(requestIp) || !IPv4_REGEX.test(visitIp)) {
    return false;
  }

  return requestIp === visitIp;
}

/**
 * Checks that the identification event URL and the request Origin are one of our sites.
 *
 * Origin is not a visitor identity check. Non-browser clients set it freely.
 * Keep a freshness check and a trusted client IP to stop replay; do not treat Origin as proof of who called.
 */
export function originIsAllowed(url = '', request: Request) {
  // This check is skipped on purpose in localhost environments.
  if (IS_DEVELOPMENT) {
    return true;
  }

  const headerOrigin = request.headers.get('origin');
  const visitDataOrigin = new URL(url).origin;
  return (
    visitDataOrigin === headerOrigin && OUR_ORIGINS.includes(visitDataOrigin) && OUR_ORIGINS.includes(headerOrigin)
  );
}

/**
 * Retrieves the full Identification event validates its authenticity.
 * - If your account has [Sealed Results](https://dev.fingerprint.com/docs/sealed-client-results) turned on, you can pass
 *   the `sealedResult` parameter to the function and it will decrypt the result locally using your decryption key
 *   instead of calling Server API (this is generally faster and simpler than Server API).
 * - If `sealedResult` is not provided or something goes wrong during decryption, the function falls back to using Server API.
 */

type GetFingerprintResultArgs = {
  eventId: string;
  req: Request;
  sealedResult?: string;
  serverApiKey?: string;
  region?: Region;
  options?: {
    blockTor?: boolean;
    blockBots?: boolean;
    minConfidenceScore?: number;
    disableFreshnessCheck?: boolean;
  };
};

export const getAndValidateFingerprintResult = async ({
  eventId,
  req,
  sealedResult,
  serverApiKey: apiKey = env.SERVER_API_KEY,
  region = getServerRegion(env.NEXT_PUBLIC_REGION),
  options,
}: GetFingerprintResultArgs): Promise<ValidationDataResult<Event>> => {
  logXForwardedForHops(req);
  let identificationEvent: Event | undefined;

  /**
   * If a sealed result was provided, try to decrypt it.
   * Fall back to Server API if sealed result is not available.
   * If your account doesn't have Sealed Results turned on you can ignore/skip this step in your implementation.
   **/
  if (sealedResult) {
    try {
      identificationEvent = await decryptSealedResult(sealedResult);
      if (identificationEvent.event_id !== eventId) {
        return {
          okay: false,
          error: 'Sealed result request ID does not match provided request ID, potential spoofing attack',
        };
      }
    } catch (error) {
      console.error(
        `Decrypting sealed result ${sealedResult.slice(0, 32)} failed on ${error}. Falling back to Server API to get the identification event`,
      );
    }
  }

  /**
   * If `sealedResult` was not provided or unsealing failed, use Server API to get the identification event.
   * The Server API must contain information about this specific identification request.
   * If not, the request might have been tampered with and we don't trust this identification attempt.
   * The Server API also allows you to access all available [Smart Signals](https://dev.fingerprint.com/docs/smart-signals-overview)
   */
  if (!identificationEvent) {
    try {
      const client = new FingerprintServerApiClient({ region, apiKey });
      identificationEvent = await client.getEvent(eventId);
    } catch (error) {
      console.error(error);
      // Throw a specific error if the request ID is not found
      if (error instanceof RequestError && error.statusCode === 404) {
        return { okay: false, error: 'Request ID not found, potential spoofing attack.' };
      }
      return { okay: false, error: String(error) };
    }
  }

  // Identification event must contain identification data
  const identification = identificationEvent.identification;
  if (!identification) {
    return { okay: false, error: 'Identification data not found, potential spoofing attack.' };
  }

  // The client request must come from the same IP address as the identification request.
  if (!visitIpMatchesRequestIp(identificationEvent.ip_address, req)) {
    return { okay: false, error: 'Identification IP does not match request IP, potential spoofing attack.' };
  }

  /**
   * Origin must match the identification event and be one of our sites.
   * This is not proof of visitor identity (non-browser clients set Origin freely).
   */
  if (!originIsAllowed(identificationEvent.url, req)) {
    return { okay: false, error: 'Visit origin does not match request origin, potential spoofing attack.' };
  }

  /**
   * An attacker might have acquired a valid eventId and visitorId via phishing.
   * It's recommended to check freshness of the identification request to prevent replay attacks.
   */
  if (
    Date.now() - identificationEvent.timestamp > ALLOWED_REQUEST_TIMESTAMP_DIFF_MS &&
    !options?.disableFreshnessCheck
  ) {
    return { okay: false, error: 'Old identification request, potential replay attack.' };
  }

  /**
   * You can prevent Tor network users from performing sensitive actions in your application.
   */
  if (options?.blockTor && identificationEvent.ip_blocklist?.tor_node === true) {
    return { okay: false, error: 'Tor network detected, please use a regular browser instead.' };
  }

  /**
   * You can prevent bots from performing sensitive actions in your application.
   */
  if (options?.blockBots && identificationEvent.bot === 'bad') {
    return { okay: false, error: '🤖 Malicious bot detected, the attempted action was denied.' };
  }

  /**
   * The Confidence Score reflects the system's degree of certainty that the visitor identifier is correct.
   * If it's lower than the certain threshold we recommend using an additional way of verification, e.g. 2FA or email.
   * This is context-sensitive and less reliable than the binary checks above, that's why it is checked last.
   * More info: https://dev.fingerprint.com/docs/understanding-your-confidence-score
   */
  if (
    identification.confidence?.score &&
    identification.confidence.score < (options?.minConfidenceScore ?? env.MIN_CONFIDENCE_SCORE)
  ) {
    return {
      okay: false,
      error: `Identification confidence score too low (${identification.confidence.score}), potential spoofing attack.`,
    };
  }

  // All checks passed, we can trust this identification event
  return { okay: true, data: identificationEvent };
};
