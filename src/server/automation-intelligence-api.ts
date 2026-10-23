import { Event } from '@fingerprint/node-sdk';
import { isIPv6 } from 'is-ip';
import { clientEnv } from '../env/client';
import { serverEnv } from '../env/server';
import { clientIpFromXForwardedFor } from './checks';
import { ORIGINAL_REQUEST_TARGET_HEADER } from './request-target';

/**
 * Calls the Fingerprint Automation Intelligence API (AI API) for the current page request.
 * It analyzes the HTTP request (headers + IP) on the server. No JS agent needed, no visitor ID.
 * - https://docs.fingerprint.com/reference/automation-intelligence-api
 * - https://docs.fingerprint.com/reference/automation-intelligence-api-collect-intelligence
 *
 * `@fingerprint/node-sdk`has no method for this endpoint yet, so this uses plain `fetch`.
 */

const AI_API_HOSTS = {
  us: 'https://api.fpjs.io',
  eu: 'https://eu.api.fpjs.io',
  ap: 'https://ap.api.fpjs.io',
};

// Keep the page fast. The AI API adds this much latency at most.
const AI_API_TIMEOUT_MS = 1500;

// Sent with empty values, as the docs require. The API only needs to see that they were present.
// Also covers e2e-test-password (see playwright.config.ts).
const SENSITIVE_HEADER_REGEX = /authorization|cookie|password|token|secret|api-key|apikey/i;

/**
 * Only the fields the Playground reads. The JSON viewer and the curl endpoint show the full response.
 * Fields: https://docs.fingerprint.com/reference/automation-intelligence-api-collect-intelligence
 */
export type AiApiEvent = Pick<Event, 'ip_info' | 'bot_info' | 'vpn' | 'proxy' | 'proxy_details'>;

export type AiApiResult = { event: AiApiEvent } | { error: string };

/**
 * @param path Original request pathname and query, e.g. `/playground?foo=bar`.
 */
export async function fetchAiApiResult(requestHeaders: Headers, path: string): Promise<AiApiResult> {
  try {
    const ip = clientIpFromXForwardedFor(requestHeaders.get('x-forwarded-for'), serverEnv.TRUSTED_PROXY_COUNT);
    if (!ip) {
      console.error('AI API request skipped: no client IP found in X-Forwarded-For.');
      return { error: 'No client IP found in X-Forwarded-For.' };
    }

    // Behind CloudFront, Host is the Digital Ocean hostname and no header has the public one.
    // CloudFront can't forward the viewer Host: Digital Ocean has no TLS cert for it (502).
    const publicUrl = new URL(path, serverEnv.PUBLIC_ORIGIN);

    const response = await fetch(`${AI_API_HOSTS[clientEnv.NEXT_PUBLIC_REGION]}/v4/edge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serverEnv.SERVER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headers: Array.from(requestHeaders)
          // Added by our Proxy, not sent by the client
          .filter(([name]) => name !== ORIGINAL_REQUEST_TARGET_HEADER)
          .map(([name, value]) => {
            if (SENSITIVE_HEADER_REGEX.test(name)) {
              return { name, value: '' };
            }
            // Signed agents (Web Bot Auth) sign the public host
            return { name, value: name === 'host' ? publicUrl.host : value };
          }),
        // Callers only serve GET. Next also answers HEAD with them, but pages can't read the method.
        method: 'GET',
        url: publicUrl.href,
        ...(isIPv6(ip) ? { ipv6_address: ip } : { ipv4_address: ip }),
      }),
      signal: AbortSignal.timeout(AI_API_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Error body is `{ error: { code, message } }`, e.g. wrong_region, too_many_requests.
      const body = await response.json().catch(() => undefined);
      console.error(`AI API request failed: ${response.status}`, body);
      return { error: `AI API returned ${response.status} ${body?.error?.code ?? ''}`.trim() };
    }
    return { event: (await response.json()) as AiApiEvent };
  } catch (error) {
    // Includes timeouts. The page must render without this section.
    console.error('AI API request failed:', error);
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
