import { expect, test } from '@playwright/test';
import { PLAYGROUND_TAG } from '../client/components/playground/playgroundTags';
import { isAgentResponse, isServerResponse } from '../client/components/playground/zodUtils';

test.describe('Playground page page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/playground');
  });

  test('Page renders basic elements', async ({ page }) => {
    await page.waitForSelector('text="Fingerprint Pro Playground"');
    await page.waitForSelector('text="Welcome, your visitor ID is"');
    await page.waitForSelector('button:text("Analyze my browser again")');

    await page.waitForSelector('text="Base signals (Pro plan)"');
    await page.waitForSelector('text="Smart signals (Pro Plus plan)"');
    await page.waitForSelector('text="Smart signals (Enterprise plan)"');

    await page.waitForSelector('text="JavaScript Agent Response"');
    await page.waitForSelector('text="Server API Response"');
  });

  test('Page renders agent response', async ({ page }) => {
    const agentResponse = JSON.parse(await page.textContent(`[data-test="${PLAYGROUND_TAG.agentResponseJSON}"]`));
    expect(isAgentResponse(agentResponse)).toBe(true);
  });

  test('Page renders server response', async ({ page }) => {
    const serverResponse = JSON.parse(await page.textContent(`[data-test="${PLAYGROUND_TAG.serverResponseJSON}"]`));
    expect(isServerResponse(serverResponse)).toBe(true);
  });
});
