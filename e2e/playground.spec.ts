import { SCRIPT_URL_PATTERN } from './../src/server/const';
import { Page, expect, test } from '@playwright/test';
import { PLAYGROUND_TAG } from '../src/client/components/playground/playgroundTags';
import { isAgentResponse, isServerResponse } from './zodUtils';
import { ENDPOINT } from '../src/server/const';

const getAgentResponse = async (page: Page) => {
  const agentResponse =
    (await (await page.getByTestId(PLAYGROUND_TAG.agentResponseJSON)).textContent()) ?? 'Agent response not found';
  return JSON.parse(agentResponse);
};

const getServerResponse = async (page: Page) => {
  const serverResponse =
    (await (await page.getByTestId(PLAYGROUND_TAG.serverResponseJSON)).textContent()) ?? 'Server response not found';
  return JSON.parse(serverResponse);
};

const clickPlaygroundRefreshButton = async (page: Page) => {
  await page.getByTestId(PLAYGROUND_TAG.refreshButton).first().click();
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.describe('Playground page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Welcome, your visitor ID is').waitFor();
    await page.getByTestId(PLAYGROUND_TAG.refreshButton).first().waitFor();

    await page.getByText('Identification', { exact: true }).waitFor();
    await page.getByText('Smart signals', { exact: true }).waitFor();
    await page.getByText('Mobile Smart signals', { exact: true }).waitFor();

    await page.getByText('JavaScript Agent Response', { exact: true }).waitFor();
    await page.getByText('Server API Response', { exact: true }).waitFor();
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.getByText('Visitor ID', { exact: true }).waitFor();
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
  test('Proxy integration works on Playground, no network errors', async ({ page }) => {
    // If any JS agent network request fails, fails the test
    // This captures proxy integration failures that would otherwise go unnoticed thanks to default endpoint fallbacks
    const endpointOrigin = new URL(ENDPOINT).origin;
    const scriptUrlPatternOrigin = new URL(SCRIPT_URL_PATTERN).origin;

    page.on('requestfailed', (request) => {
      console.error(request.url(), request.failure()?.errorText);
      const requestOrigin = new URL(request.url()).origin;

      if (requestOrigin === endpointOrigin || requestOrigin === scriptUrlPatternOrigin) {
        // This fails the test
        expect(request.failure()).toBeUndefined();
      }
    });

    await page.goto('/playground');
    await clickPlaygroundRefreshButton(page);
  });
});
