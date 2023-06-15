import { expect, test } from '@playwright/test';
import { PLAYGROUND_TAG } from '../client/components/playground/playgroundTags';
import { isAgentResponse, isServerResponse } from '../client/components/playground/zodUtils';

const getAgentResponse = async (page) => {
  const agentResponse = await page.textContent(`[data-test="${PLAYGROUND_TAG.agentResponseJSON}"]`);
  return JSON.parse(agentResponse);
};

const getServerResponse = async (page) => {
  const serverResponse = await page.textContent(`[data-test="${PLAYGROUND_TAG.serverResponseJSON}"]`);
  return JSON.parse(serverResponse);
};

const clickRefreshButton = async (page) => {
  await page.click(`[data-test="${PLAYGROUND_TAG.refreshButton}"]`);
  await page.waitForLoadState('networkidle');
};

test.describe('Playground page page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.waitForSelector('text="Fingerprint Pro Playground"');
    await page.waitForSelector('text="Welcome, your visitor ID is"');
    await page.waitForSelector(`[data-test="${PLAYGROUND_TAG.refreshButton}"]`);

    await page.waitForSelector('text="Base signals (Pro plan)"');
    await page.waitForSelector('text="Smart signals (Pro Plus plan)"');
    await page.waitForSelector('text="Smart signals (Enterprise plan)"');

    await page.waitForSelector('text="JavaScript Agent Response"');
    await page.waitForSelector('text="Server API Response"');
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.waitForSelector('text="Visitor ID"');
    await page.waitForSelector('text="Last seen"');
    await page.waitForSelector('text="Confidence Score"');

    await page.waitForSelector('text="Geolocation"');
    await page.waitForSelector('text="VPN"');

    await page.waitForSelector('text="IP Blocklist"');
    await page.waitForSelector('text="Android Emulator"');
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
