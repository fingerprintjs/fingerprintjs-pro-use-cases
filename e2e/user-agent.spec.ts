import { expect, test } from '@playwright/test';
import { FINGERPRINT_BOT_USER_AGENT } from './fingerprintBotUserAgent';

test('uses FingerprintBot user agent', async ({ page }) => {
  expect(await page.evaluate(() => navigator.userAgent)).toBe(FINGERPRINT_BOT_USER_AGENT);
});
