/**
 * Returns the raw Automation Intelligence API (AI API) event for this request as JSON, or `{ error }`.
 * Serves `/automation-intelligence.json`, and `/automation-intelligence` for clients that don't accept HTML, like curl (see `proxy.ts`).
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
import { NextRequest } from 'next/server';
import { fetchAiApiResult } from '../../server/automation-intelligence-api';
import { ORIGINAL_REQUEST_TARGET_HEADER } from '../../server/request-target';

export async function GET(request: NextRequest) {
  // Proxy sets it to the URL the client asked for, which can be `/automation-intelligence`
  const requestTarget =
    request.headers.get(ORIGINAL_REQUEST_TARGET_HEADER) ?? request.nextUrl.pathname + request.nextUrl.search;
  const result = await fetchAiApiResult(request.headers, requestTarget);
  // Pretty-printed with a trailing newline, so plain `curl` output is readable in a terminal
  const body = JSON.stringify('event' in result ? result.event : result, null, 2) + '\n';
  return new Response(body, {
    status: 'event' in result ? 200 : 502,
    headers: {
      'Content-Type': 'application/json',
      // The result is per request, so no cache (e.g. CloudFront) may store it
      'Cache-Control': 'no-store',
      // `/automation-intelligence` is HTML or JSON based on Accept.
      // Set here: Next drops headers that Proxy sets on a rewrite.
      Vary: 'Accept',
    },
  });
}
