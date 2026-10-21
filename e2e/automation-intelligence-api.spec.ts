import { expect, test } from '@playwright/test';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../src/envShared';

const URL = '/automation-intelligence';

// The hourly production run cannot pick the client IP, so it only checks that a result comes back.
test('returns the AI API event on the hosted site', async ({ request }) => {
  test.skip(!PRODUCTION_E2E_TEST_BASE_URL, 'Hosted site only');
  const response = await request.get(URL);
  expect(response.status()).toBe(200);
  expect((await response.json()).ip_info).toBeDefined();
});

// The AI API is called from the Next server, so the test cannot mock it.
// X-Forwarded-For picks the client IP the server sends to the real AI API (TRUSTED_PROXY_COUNT is 0 in tests).
test.describe('with a known client IP', () => {
  test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': '8.8.8.8' } });

  test('returns the raw event as JSON by default', async ({ request }) => {
    const response = await request.get(URL);
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('no-store');
    const event = await response.json();
    expect(event.source).toBe('edge');
    expect(event.ip_info.v4.address).toBe('8.8.8.8');
  });

  test('returns a text summary', async ({ request }) => {
    const response = await request.get(`${URL}?format=text`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/plain');
    const text = await response.text();
    expect(text).toContain('IP address: 8.8.8.8\n');
    expect(text).toContain('Data center IP: Yes (Google)\n');
  });

  test('returns an HTML page with the summary and the raw event', async ({ request }) => {
    const response = await request.get(`${URL}?format=html`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
    const html = await response.text();
    expect(html).toContain('<tr><th>IP address</th><td>8.8.8.8</td></tr>');
    expect(html).toContain('&#34;source&#34;: &#34;edge&#34;');
  });

  test('rejects an unknown format', async ({ request }) => {
    const response = await request.get(`${URL}?format=xml`);
    expect(response.status()).toBe(400);
  });
});

test.describe('with an invalid client IP', () => {
  test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');
  test.use({ extraHTTPHeaders: { 'x-forwarded-for': 'not-an-ip' } });

  test('returns the error', async ({ request }) => {
    const response = await request.get(`${URL}?format=text`);
    expect(response.status()).toBe(502);
    expect(await response.text()).toMatch(/^AI API result unavailable: AI API returned 400/);
  });
});
