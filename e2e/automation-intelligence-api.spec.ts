/**
 * Automation Intelligence API (AI API) results on the Playground page and the `/automation-intelligence` endpoint.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
import { Page, expect, test } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../src/envShared';

const URL = '/automation-intelligence';
const getAiApiSection = async (page: Page) => {
  await page.goto('/playground');
  return page.getByTestId(TEST_IDS.playground.aiApiSection);
};

// The Playground server-renders the AI API section, so check it without JS
test.use({ javaScriptEnabled: false });

// The hourly production run cannot pick the client IP, so it only checks that a result comes back.
test('returns the AI API result on the hosted site', async ({ page, request }) => {
  test.skip(!PRODUCTION_E2E_TEST_BASE_URL, 'Hosted site only');
  const response = await request.get(URL);
  expect(response.status()).toBe(200);
  expect((await response.json()).ip_info).toBeDefined();
  await expect((await getAiApiSection(page)).getByRole('row', { name: /^IP address/ })).toBeVisible();
});

// The AI API is called from the Next server, so the test cannot mock it.
// X-Forwarded-For picks the client IP the server sends to the real AI API (TRUSTED_PROXY_COUNT is 0 in tests).
// Behind the production proxies, the server takes the real client IP instead, so skip these there.
test.describe('with a chosen client IP', () => {
  test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');

  test.describe('known IP', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': '8.8.8.8' } });

    test('endpoint returns the raw event as JSON', async ({ request }) => {
      const response = await request.get(URL);
      expect(response.status()).toBe(200);
      expect(response.headers()['cache-control']).toBe('no-store');
      const event = await response.json();
      expect(event.source).toBe('edge');
      expect(event.ip_info.v4.address).toBe('8.8.8.8');
    });

    test('Playground shows the result table', async ({ page }) => {
      const section = await getAiApiSection(page);
      await expect(section.getByRole('row', { name: 'IP address 8.8.8.8' })).toBeVisible();
      await expect(section.getByRole('row', { name: 'Data center IP Yes (Google)' })).toBeVisible();
    });
  });

  test.describe('IPv6', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': '2001:4860:4860::8888' } });

    test('endpoint returns the event for an IPv6 client', async ({ request }) => {
      const response = await request.get(URL);
      expect(response.status()).toBe(200);
      expect((await response.json()).ip_info.v6.address).toBe('2001:4860:4860::8888');
    });
  });

  test.describe('invalid IP', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': 'not-an-ip' } });

    test('endpoint returns the error', async ({ request }) => {
      const response = await request.get(URL);
      expect(response.status()).toBe(502);
      expect((await response.json()).error).toMatch(/^AI API returned 400/);
    });

    test('Playground shows the unavailable note', async ({ page }) => {
      const section = await getAiApiSection(page);
      await expect(section.getByText(/result unavailable: AI API returned 400/)).toBeVisible();
    });
  });
});
