import { Event } from '@fingerprint/node-sdk';
import { isIPv6 } from 'is-ip';
import { clientEnv } from '../env/client';
import { serverEnv } from '../env/server';
import { clientIpFromXForwardedFor } from './checks';

/**
 * Calls the Fingerprint Automation Intelligence API (AI API) for the current page request.
 * It analyzes the HTTP request (headers + IP) on the server. No JS agent needed, no visitor ID.
 * - https://docs.fingerprint.com/reference/automation-intelligence-api
 * - https://docs.fingerprint.com/reference/automation-intelligence-api-collect-intelligence
 *
 * `@fingerprint/node-sdk` 7.7.0 has no method for this endpoint yet, so this uses plain `fetch`.
 * The response matches the SDK `Event` type (`source: 'edge'`).
 */

const AI_API_HOSTS = {
  us: 'https://api.fpjs.io',
  eu: 'https://eu.api.fpjs.io',
  ap: 'https://ap.api.fpjs.io',
};

// The API rejects requests sent later than 5 seconds after the original request. Keep the page fast too.
const AI_API_TIMEOUT_MS = 3000;

// Sent with empty values, as the docs require. The API only needs to see that they were present.
// Also covers e2e-test-password (see playwright.config.ts).
const SENSITIVE_HEADER_REGEX = /authorization|cookie|password|token|secret|api-key|apikey/i;

export type AiApiResult = { event: Event } | { error: string };

export async function fetchAiApiResult(requestHeaders: Headers): Promise<AiApiResult> {
  try {
    const ip = clientIpFromXForwardedFor(requestHeaders.get('x-forwarded-for'), serverEnv.TRUSTED_PROXY_COUNT);
    if (!ip) {
      return { error: 'No client IP found in X-Forwarded-For.' };
    }

    // Behind CloudFront and DigitalOcean, `request.url` only says "localhost" (see src/proxy.ts), so rebuild it.
    // CloudFront also replaces Host with the Digital Ocean hostname, and no other header has the public one.
    // Forwarding the viewer Host breaks TLS to Digital Ocean (502), since it has no cert for the public domain.
    // So deployments set PUBLIC_ORIGIN, and local runs fall back to the request headers.
    // A page cannot read its own path or fragment from headers, and the API rejects `#fragment`.
    const protocol = requestHeaders.get('x-forwarded-proto')?.split(',')[0]?.trim() || 'http';
    const origin = new URL(serverEnv.PUBLIC_ORIGIN ?? `${protocol}://${requestHeaders.get('host')}`);
    const url = `${origin.origin}/playground`;

    const response = await fetch(`${AI_API_HOSTS[clientEnv.NEXT_PUBLIC_REGION]}/v4/edge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${serverEnv.SERVER_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        headers: Array.from(requestHeaders, ([name, value]) => ({
          name,
          // Signed agents (Web Bot Auth) sign the public host, so send that, not the Digital Ocean one
          value: SENSITIVE_HEADER_REGEX.test(name) ? '' : name === 'host' ? origin.host : value,
        })),
        method: 'GET',
        url,
        ...(isIPv6(ip) ? { ipv6_address: ip } : { ipv4_address: ip }),
      }),
      signal: AbortSignal.timeout(AI_API_TIMEOUT_MS),
      cache: 'no-store',
    });

    if (!response.ok) {
      // Error body is `{ error: { code, message } }`, e.g. wrong_region, too_many_requests.
      const body = await response.json().catch(() => undefined);
      return { error: `AI API returned ${response.status} ${body?.error?.code ?? ''}`.trim() };
    }
    return { event: (await response.json()) as Event };
  } catch (error) {
    // Includes timeouts. The page must render without this section.
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
