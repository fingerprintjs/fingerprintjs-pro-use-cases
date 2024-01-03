import { expect, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { BOT_FIREWALL_COPY } from '../src/client/bot-firewall/botFirewallCopy';

test.describe('Bot Firewall Demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coupon-fraud');
    await resetScenarios(page);
  });

  test('Should display bot visit a allow blocking IP address', async ({ page }) => {
    // Record bot visit in web-scraping page
    await page.goto('/web-scraping');
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');

    // Check bot visit record and block IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.blockIp }).first().click();
    await page.getByText('was blocked in the application firewall').waitFor();
    await page.waitForTimeout(5000);

    /**
     * Try to visit web-scraping page, should be blocked by Cloudflare
     * Checking the response code here as parsing the actual page if flaky for some reason
     */
    const responsePromise = page.waitForResponse('https://staging.fingerprinthub.com/web-scraping');
    page.goto('https://staging.fingerprinthub.com/web-scraping');
    expect((await responsePromise).status()).toBe(403);

    // Unblock IP
    await page.goto('/bot-firewall');
    await page.getByRole('button', { name: BOT_FIREWALL_COPY.unblockIp }).first().click();
    await page.getByText('was unblocked in the application firewall').waitFor();
    await page.waitForTimeout(5000);

    // Try to visit web-scraping page, should be allowed again
    await page.goto('https://staging.fingerprinthub.com/web-scraping');
    await page.reload();
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');
  });
});
