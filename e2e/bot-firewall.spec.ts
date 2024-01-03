import { expect, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { BOT_FIREWALL_COPY } from '../src/client/bot-firewall/botFirewallCopy';

/**
 * CHROME_ONLY flag tells the GitHub action to run this test only using Chrome.
 * This test relies on a single common Cloudflare ruleset, we we cannot run multiple instances of it at the same time.
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
     * Checking the response code here as parsing the actual page if flaky for some reason.
     * Using a separate tab also seems to help with flakiness.
     */
    const secondTab = await context.newPage();
    await secondTab.goto('https://staging.fingerprinthub.com/web-scraping');
    await secondTab.reload();
    await secondTab.getByRole('heading', { name: 'Sorry, you have been blocked' }).waitFor();

    // Unblock IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.unblockIp }).first().click();
    await page.getByText('was unblocked in the application firewall').waitFor();
    await page.waitForTimeout(3000);

    // Try to visit web-scraping page, should be allowed again
    await secondTab.goto('https://staging.fingerprinthub.com/web-scraping');
    await secondTab.reload();
    await expect(secondTab.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');
  });
});
