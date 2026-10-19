import { Page, expect, test } from '@playwright/test';
import { assertAlert, blockGoogleTagManager, scrollToView } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../src/envShared';

const TEST_ID = TEST_IDS.playground;

const getAgentResponse = async (page: Page) => {
  const agentResponse = await page.getByTestId(TEST_ID.agentResponseJSON);
  const agentResponseText = await agentResponse.textContent();
  return agentResponseText ?? 'Agent response not found';
};

const getServerResponse = async (page: Page) => {
  const serverResponse = await page.getByTestId(TEST_ID.serverResponseJSON);
  const serverResponseText = await serverResponse.textContent();
  return serverResponseText ?? 'Server response not found';
};

function parseEventId(inputString: string) {
  const regex = /(?:event_id|requestId):\s*"([^"]+)"/;
  const match = inputString.match(regex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}

const clickPlaygroundRefreshButton = async (page: Page) => {
  await page.getByTestId(TEST_ID.refreshButton).first().click();
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/playground', { waitUntil: 'networkidle' });
});

test.describe('Playground page without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // The hourly production run cannot pick the client IP, so it only checks that a result renders.
  test('server-renders the AI API result table on the hosted site', async ({ page }) => {
    test.skip(!PRODUCTION_E2E_TEST_BASE_URL, 'Hosted site only');
    await expect(page.getByTestId(TEST_ID.aiApiSection).getByRole('row', { name: /^IP address/ })).toBeVisible();
  });

  // The AI API is called from the Next server, so the browser cannot mock it.
  // X-Forwarded-For picks the client IP the server sends to the real AI API (TRUSTED_PROXY_COUNT is 0 in tests).
  // Behind the production proxies, the server takes the real client IP instead, so skip these there.
  test.describe('with a known client IP', () => {
    test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': '8.8.8.8' } });

    test('server-renders the AI API result table', async ({ page }) => {
      const section = page.getByTestId(TEST_ID.aiApiSection);
      await expect(section.getByText('Automation Intelligence API', { exact: true })).toBeVisible();
      await expect(section.getByRole('row', { name: 'IP address 8.8.8.8' })).toBeVisible();
      await expect(section.getByRole('row', { name: 'Data center IP Yes (Google)' })).toBeVisible();
    });
  });

  test.describe('with an invalid client IP', () => {
    test.skip(Boolean(PRODUCTION_E2E_TEST_BASE_URL), 'Needs control of X-Forwarded-For');
    test.use({ extraHTTPHeaders: { 'x-forwarded-for': 'not-an-ip' } });

    test('server-renders the AI API unavailable note', async ({ page }) => {
      const section = page.getByTestId(TEST_ID.aiApiSection);
      await expect(section.getByText(/result unavailable: AI API returned 400/)).toBeVisible();
    });
  });
});

test.describe('Playground page', () => {
  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Your Visitor ID is').waitFor();
    await page.getByTestId(TEST_ID.refreshButton).first().waitFor();

    await page.getByText('Identification', { exact: true }).waitFor();
    await page.getByText('Smart signals', { exact: true }).waitFor();
    await page.getByText('Mobile Smart signals', { exact: true }).waitFor();

    await page.getByText('JavaScript Agent Response', { exact: true }).waitFor();
    await page.getByText('Server API Response', { exact: true }).waitFor();
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.getByText('Last Seen', { exact: true }).waitFor();
    await page.getByText('Confidence Score', { exact: true }).waitFor();

    await page.getByText('Geolocation', { exact: true }).waitFor();
    await page.getByText('VPN', { exact: true }).waitFor();

    await page.getByText('IP Blocklist', { exact: true }).waitFor();
    await page.getByText('Proxy Detection', { exact: true }).waitFor();
    await page.getByText('Rare Device', { exact: true }).waitFor();
    await page.getByText('Emulator', { exact: true }).waitFor();
    await page.getByText('iOS Simulator', { exact: true }).waitFor();
    await page.getByText('Proximity Detection', { exact: true }).waitFor();
    await page.getByText('Tampered Request', { exact: true }).waitFor();
    await page.getByText('Active Call Detection', { exact: true }).waitFor();
    await page.getByText('Developer Tools (Mobile)', { exact: true }).waitFor();
    await page.getByText('VPN (Mobile)', { exact: true }).waitFor();
  });

  test('Page renders agent response', async ({ page }) => {
    const agentResponse = await getAgentResponse(page);
    expect(agentResponse).toContain('event_id');
    expect(agentResponse).toContain('visitor_id');
  });

  test('Page renders server response', async ({ page }) => {
    const serverResponse = await getServerResponse(page);

    expect(serverResponse).toContain('event_id');
    expect(serverResponse).toContain('visitor_id');
    expect(serverResponse).toContain('incognito');
    expect(serverResponse).toContain('bot');
    expect(serverResponse).toContain('vpn');
    expect(serverResponse).toContain('privacy_settings');
  });

  test('Reload button updates agent response', async ({ page }) => {
    const oldEventId = parseEventId(await getAgentResponse(page));
    await clickPlaygroundRefreshButton(page);
    const eventId = parseEventId(await getAgentResponse(page));

    expect(oldEventId).not.toBeNull();
    expect(eventId).not.toBeNull();
    expect(oldEventId).toHaveLength(20);
    expect(eventId).toHaveLength(20);
    expect(eventId).not.toEqual(oldEventId);
  });

  test('Reload button updates server response', async ({ page }) => {
    const oldEventId = parseEventId(await getServerResponse(page));
    await clickPlaygroundRefreshButton(page);
    const eventId = parseEventId(await getServerResponse(page));

    expect(oldEventId).not.toBeNull();
    expect(eventId).not.toBeNull();
    expect(oldEventId).toHaveLength(20);
    expect(eventId).toHaveLength(20);
    expect(eventId).not.toEqual(oldEventId);
  });

  test('Clicking JSON link scrolls to appropriate JSON property', async ({ page }) => {
    const seeJsonLink = await page.getByText('See the JSON below');
    await scrollToView(seeJsonLink);
    await seeJsonLink.click();
    await expect(page.locator('span.json-view--property:text("raw_device_attributes")')).toBeInViewport();
  });

  test('shows error alert while keeping results when server API fails on refresh', async ({ page }) => {
    await page.getByText('Your Visitor ID is').waitFor();

    await page.route('**/api/event/v4/**', (route) => route.abort('failed'));

    await clickPlaygroundRefreshButton(page);

    await assertAlert({ page, severity: 'error', text: 'Server API Request' });
    await expect(page.getByText('Your Visitor ID is')).toBeVisible();
  });

  test('keeps the AI API section when the first Server API request fails', async ({ page }) => {
    await page.route('**/api/event/v4/**', (route) => route.abort('failed'));
    await page.reload();

    await assertAlert({ page, severity: 'error', text: 'Server API Request' });
    await expect(page.getByTestId(TEST_ID.aiApiSection)).toBeVisible();
  });
});

test.describe('Proxy integration', () => {
  const proxyIntegrations = [
    'https://metrics.fingerprinthub.com',
    'https://demo.fingerprint.com/DBqbMN7zXxwl4Ei8',
    process.env.NEXT_PUBLIC_ENDPOINT ?? 'NO_CUSTOM_PROXY_IN_ENV',
  ];

  /**
   * If any JS agent network request fails, fail the test.
   * This captures proxy integration failures that would otherwise go unnoticed thanks to default endpoint fallbacks.
   */
  test('Proxy integration works on Playground, no network errors', async ({ page }) => {
    page.on('requestfailed', (request) => {
      const url = request.url();
      const failure = request.failure()?.errorText;

      proxyIntegrations.forEach((proxy) => {
        if (url.includes(proxy)) {
          // This fails the test and prints the relevant info in test result
          expect(url + ' ' + failure).toBeUndefined();
        }
      });
    });

    await clickPlaygroundRefreshButton(page);
  });
});
