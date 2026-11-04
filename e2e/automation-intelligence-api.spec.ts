/**
 * Automation Intelligence API (AI API) results on the Automation Intelligence Playground and the `/automation-intelligence` endpoint.
 * https://docs.fingerprint.com/reference/automation-intelligence-api
 */
import { Page, expect, test } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../src/envShared';

const AI_API_ENDPOINT = '/automation-intelligence';
const AI_API_PAGE = '/automation-intelligence-playground';
const getAiApiSection = async (page: Page) => {
  await page.goto(AI_API_PAGE);
  return page.getByTestId(TEST_IDS.automationIntelligencePlayground.aiApiSection);
};

// The page server-renders the AI API section, so check it without JS
test.use({ javaScriptEnabled: false });

test('page shows every how-to step without JavaScript', async ({ page }) => {
  await page.goto(AI_API_PAGE);
  // The last step, only in the HTML if the accordion renders every item open
  await expect(page.getByText("curl -A 'GPTBot/1.0'")).toBeVisible();
});

// Runs only against a deployed site: the hourly production e2e run, or staging by hand.
// It cannot pick the client IP, so it checks the parts that do not depend on it.
test.describe('on the hosted site', () => {
  test.skip(!PRODUCTION_E2E_TEST_BASE_URL, 'Hosted site only');

  test('endpoint returns the AI API event', async ({ request }) => {
    const response = await request.get(AI_API_ENDPOINT);
    expect(response.status()).toBe(200);
    const event = await response.json();
    expect(event.source).toBe('edge');
    // Checks PUBLIC_ORIGIN: behind CloudFront the server only sees the Digital Ocean host
    expect(event.url).toBe(`${PRODUCTION_E2E_TEST_BASE_URL}${AI_API_ENDPOINT}`);
  });

  test('page shows the AI API result', async ({ page }) => {
    const section = await getAiApiSection(page);
    await expect(section.getByRole('row', { name: /^IP address/ })).toBeVisible();
  });
});

test.describe('page request URLs', () => {
  // Linux WebKit rewrites percent escapes before sending (`%31` -> `1`, `%2f` -> `%2F`).
  // `page.url()` still shows the typed URL, so the test cannot know what the server got.
  test.skip(({ browserName }) => browserName === 'webkit', 'Linux WebKit rewrites the query');

  test('page preserves query encoding and order without JavaScript', async ({ page, baseURL, extraHTTPHeaders }) => {
    await page.setExtraHTTPHeaders({
      ...extraHTTPHeaders,
      ...(!PRODUCTION_E2E_TEST_BASE_URL ? { 'x-forwarded-for': '8.8.8.8' } : {}),
      'x-fp-original-request-target': '/spoofed?ignored=1',
    });
    const requestPath = `${AI_API_PAGE}?a=%31&b=1&a=2&c=&x=%2f%20`;
    await page.goto(requestPath);
    await expect(page.getByTestId(TEST_IDS.automationIntelligencePlayground.aiApiSection)).toContainText(
      `${baseURL}${requestPath}`,
    );
  });
});

// Runs locally and in PR CI only. Skipped in the hourly production e2e run.
// - The test picks the client IP with X-Forwarded-For (TRUSTED_PROXY_COUNT is 0 in tests).
// - Behind the production proxies, the server ignores it and uses the real client IP.
// - The AI API is called from the Next server, not the browser, so the test cannot mock it.
test.describe('with a chosen client IP', () => {
  test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');

  test.describe('known IP', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': '8.8.8.8' } });

    test('endpoint returns the raw event as JSON', async ({ request }) => {
      const response = await request.get(AI_API_ENDPOINT);
      expect(response.status()).toBe(200);
      expect(response.headers()['cache-control']).toBe('no-store');
      const event = await response.json();
      expect(event.source).toBe('edge');
      expect(event.ip_info.v4.address).toBe('8.8.8.8');
    });

    test('page shows the result table', async ({ page }) => {
      const section = await getAiApiSection(page);
      await expect(section.getByRole('row', { name: 'IP address 8.8.8.8' })).toBeVisible();
      await expect(section.getByRole('row', { name: 'Data center IP Yes (Google)' })).toBeVisible();
    });
  });

  test.describe('IPv6', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': '2001:4860:4860::8888' } });

    test('endpoint returns the event for an IPv6 client', async ({ request }) => {
      const response = await request.get(AI_API_ENDPOINT);
      expect(response.status()).toBe(200);
      expect((await response.json()).ip_info.v6.address).toBe('2001:4860:4860::8888');
    });
  });

  test.describe('invalid IP', () => {
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': 'not-an-ip' } });

    test('endpoint returns the error', async ({ request }) => {
      const response = await request.get(AI_API_ENDPOINT);
      expect(response.status()).toBe(502);
      expect((await response.json()).error).toMatch(/^AI API returned 400/);
    });

    test('page shows the unavailable note', async ({ page }) => {
      const section = await getAiApiSection(page);
      await expect(section.getByText(/result unavailable: AI API returned 400/)).toBeVisible();
    });
  });
});
