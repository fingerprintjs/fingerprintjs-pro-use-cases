/**
 * Returns the Automation Intelligence API (AI API) result for this request, for curl and other simple HTTP clients.
 * - `?format=json` (default): the raw AI API event, or `{ error }`
 * - `?format=text`: the same summary as the Playground table, one `Label: value` per line
 * - `?format=html`: the summary table and the raw event in a minimal page
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
import { NextRequest } from 'next/server';
import { fetchAiApiResult } from '../../../server/automation-intelligence-api';
import { getAiApiSummary } from '../../../utils/aiApiSummary';

const FORMATS = ['json', 'text', 'html'];

// The result is per request, so no cache (e.g. CloudFront) may store it
const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET(request: NextRequest) {
  const format = request.nextUrl.searchParams.get('format') ?? 'json';
  if (!FORMATS.includes(format)) {
    return new Response(`Unknown format "${format}". Use one of: ${FORMATS.join(', ')}.\n`, {
      status: 400,
      headers: NO_STORE,
    });
  }

  const result = await fetchAiApiResult(request.headers, request.nextUrl.pathname + request.nextUrl.search);
  const status = 'event' in result ? 200 : 502;

  if (format === 'json') {
    return Response.json('event' in result ? result.event : result, { status, headers: NO_STORE });
  }

  const rows: [string, string][] =
    'event' in result ? getAiApiSummary(result.event) : [['AI API result unavailable', result.error]];

  if (format === 'text') {
    return new Response(rows.map(([label, value]) => `${label}: ${value}\n`).join(''), {
      status,
      headers: { ...NO_STORE, 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  // Values come from request headers (e.g. bot names), so escape them
  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);
  const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Automation Intelligence API</title></head>
<body>
<h1>Automation Intelligence API</h1>
<table>
${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`).join('\n')}
</table>
${'event' in result ? `<pre>${escapeHtml(JSON.stringify(result.event, null, 2))}</pre>` : ''}
</body>
</html>
`;
  return new Response(html, { status, headers: { ...NO_STORE, 'Content-Type': 'text/html; charset=utf-8' } });
}
