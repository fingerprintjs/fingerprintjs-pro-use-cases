import { expect, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { BOT_FIREWALL_COPY } from '../src/client/bot-firewall/botFirewallCopy';

/**
 * CHROME_ONLY flag tells the GitHub action to run this test only using Chrome.
 * Since this test relies on a single common Cloudflare ruleset we need to prevent it from running in multiple browsers in parallel,
 * they would trip over each other and fail.
 */
test.describe('Bot Firewall Demo CHROME_ONLY', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coupon-fraud');
    await resetScenarios(page);
  });

  test('Should display bot visit and allow blocking/unblocking its IP address', async ({ page, context }) => {
    // Record bot visit in web-scraping page
    await page.goto('/web-scraping');
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');

    // Check bot visit record and block IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.blockIp }).first().click();
    await page.getByText('was blocked in the application firewall').waitFor();
    await page.waitForTimeout(3000);

    /**
     * Try to visit web-scraping page, should be blocked by Cloudflare
     * Checking the response code here as parsing the actual page if flaky for some reason
     */
    const secondPage = await context.newPage();
    const responsePromise = secondPage.waitForResponse('https://staging.fingerprinthub.com/web-scraping');
    await secondPage.goto('https://staging.fingerprinthub.com/web-scraping');
    expect((await responsePromise).status()).toBe(403);

    // Unblock IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.unblockIp }).first().click();
    await page.getByText('was unblocked in the application firewall').waitFor();
    await page.waitForTimeout(3000);

    // Try to visit web-scraping page, should be allowed again
    await secondPage.goto('https://staging.fingerprinthub.com/web-scraping');
    await secondPage.reload();
    await expect(secondPage.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');
  });
});
