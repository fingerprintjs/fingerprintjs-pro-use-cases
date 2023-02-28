// @ts-check
import { expect, test } from '@playwright/test';

const isDebugMode = Boolean(process.env.PWDEBUG);

test.describe('Web scraping flights', () => {
  test('Web scraping should fail (Bot detection enabled by default)', async ({ page }) => {
    await page.goto('/web-scraping');
    await page.click('button:has-text("Search flights")');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.message')).toContainText('Malicious bot detected');
    console.log(process.env);
    // if in debug mode, pause script execution
    if (isDebugMode) {
      await page.pause();
    }
  });
});
