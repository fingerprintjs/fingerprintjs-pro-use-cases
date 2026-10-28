/**
 * Returns the raw Automation Intelligence API (AI API) event for this request as JSON, or `{ error }`.
 * For curl and other simple HTTP clients.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
import { NextRequest } from 'next/server';
import { fetchAiApiResult } from '../../server/automation-intelligence-api';

export async function GET(request: NextRequest) {
  const result = await fetchAiApiResult(request.headers, request.nextUrl.pathname + request.nextUrl.search);
  // Pretty-printed with a trailing newline, so plain `curl` output is readable in a terminal
  const body = JSON.stringify('event' in result ? result.event : result, null, 2) + '\n';
  return new Response(body, {
    status: 'event' in result ? 200 : 502,
    headers: {
      'Content-Type': 'application/json',
      // The result is per request, so no cache (e.g. CloudFront) may store it
      'Cache-Control': 'no-store',
    },
  });
}
