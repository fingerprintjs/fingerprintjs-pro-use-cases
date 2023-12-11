import { Page, expect, test } from '@playwright/test';
import { PLAYGROUND_TAG } from '../src/client/components/playground/playgroundTags';
import { isAgentResponse, isServerResponse } from './zodUtils';

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

const clickRefreshButton = async (page: Page) => {
  await page.getByTestId(PLAYGROUND_TAG.refreshButton).first().click();
  await page.waitForLoadState('networkidle');
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.describe('Playground page page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Welcome, your visitor ID is').waitFor();
    await page.getByTestId(PLAYGROUND_TAG.refreshButton).first().waitFor();

    await page.getByText('Base signals (Pro plan)', { exact: true }).waitFor();
    await page.getByText('Smart signals (Pro Plus plan)', { exact: true }).waitFor();
    await page.getByText('Smart signals (Enterprise plan)', { exact: true }).waitFor();

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
    await clickRefreshButton(page);
    const { requestId } = await getAgentResponse(page);

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
  });

  test('Reload button updates server response', async ({ page }) => {
    const oldRequestId = (await getServerResponse(page)).products.botd.data.requestId;
    await clickRefreshButton(page);
    const requestId = (await getServerResponse(page)).products.botd.data.requestId;

    expect(oldRequestId).toHaveLength(20);
    expect(requestId).toHaveLength(20);
    expect(requestId).not.toEqual(oldRequestId);
  });
});
