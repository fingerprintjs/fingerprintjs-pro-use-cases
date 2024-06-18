import { Page, expect, test } from '@playwright/test';
import { isAgentResponse, isServerResponse } from './zodUtils';
import { blockGoogleTagManager } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';

const TEST_ID = TEST_IDS.playground;

const getAgentResponse = async (page: Page) => {
  const agentResponse =
    (await (await page.getByTestId(TEST_ID.agentResponseJSON)).textContent()) ?? 'Agent response not found';
  return JSON.parse(agentResponse);
};

const getServerResponse = async (page: Page) => {
  const serverResponse =
    (await (await page.getByTestId(TEST_ID.serverResponseJSON)).textContent()) ?? 'Server response not found';
  return JSON.parse(serverResponse);
};

const clickPlaygroundRefreshButton = async (page: Page) => {
  await page.getByTestId(TEST_ID.refreshButton).first().click();
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/playground');
});

test.describe('Playground page', () => {
  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Welcome, this is your visitor ID').waitFor();
    await page.getByTestId(TEST_ID.refreshButton).first().waitFor();

    await page.getByText('Identification', { exact: true }).waitFor();
    await page.getByText('Smart signals', { exact: true }).waitFor();
    await page.getByText('Mobile Smart signals', { exact: true }).waitFor();

    await page.getByText('JavaScript Agent Response', { exact: true }).waitFor();
    await page.getByText('Server API Response', { exact: true }).waitFor();
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.getByText('Last seen', { exact: true }).waitFor();
    await page.getByText('Confidence Score', { exact: true }).waitFor();

    await page.getByText('Geolocation', { exact: true }).waitFor();
    await page.getByText('VPN', { exact: true }).waitFor();

    await page.getByText('IP Blocklist', { exact: true }).waitFor();
    await page.getByText('Emulator', { exact: true }).waitFor();
  });

  test('Page renders agent response', async ({ page }) => {
    const agentResponse = await getAgentResponse(page);
    expect(isAgentResponse(agentResponse)).toBe(true);
  });

  test('Page renders server response', async ({ page }) => {
    const serverResponse = await getServerResponse(page);
    expect(isServerResponse(serverResponse)).toBe(true);
  });

  test('Reload button updates agent response', async ({ page }) => {
    const { requestId: oldRequestId } = await getAgentResponse(page);
    await clickPlaygroundRefreshButton(page);
    const { requestId } = await getAgentResponse(page);

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
  });

  test('Reload button updates server response', async ({ page }) => {
    const oldRequestId = (await getServerResponse(page)).products.botd.data.requestId;
    await clickPlaygroundRefreshButton(page);
    const requestId = (await getServerResponse(page)).products.botd.data.requestId;

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
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
