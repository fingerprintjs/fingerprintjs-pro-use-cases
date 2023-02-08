// @ts-check
import { test } from '@playwright/test';
import { getWebsiteUrl } from './url';
import { reset } from './admin';

test.describe('Coupon fraud', () => {
  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    const url = getWebsiteUrl();
    url.pathname = '/coupon-fraud';

    await page.goto(url.toString());
  });

  test('should apply correct coupon only once', async ({ page }) => {
    await page.type('#coupon_code', 'Promo3000');

    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('text="Coupon claimed you get a 119 USD discount!"');

    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    await page.waitForSelector('text="The visitor used this coupon before."');
  });
});
