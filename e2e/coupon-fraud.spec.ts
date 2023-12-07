import { test } from '@playwright/test';
import { resetScenarios } from './resetHelper';

test.describe('Coupon fraud', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coupon-fraud');
    await resetScenarios(page);
  });

  test('should apply correct coupon only once', async ({ page }) => {
    await page.fill('#coupon_code', 'Promo3000');

    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    await page.getByText('Coupon claimed').waitFor();

    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');

    await page.getByText('The visitor used this coupon before.').waitFor();
  });

  test('should prevent spamming multiple coupons', async ({ page }) => {
    await page.fill('#coupon_code', 'Promo3000');
    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');
    await page.getByText('Coupon claimed').waitFor();

    await page.fill('#coupon_code', 'BlackFriday', {});
    await page.click('button:has-text("Apply")');
    await page.waitForLoadState('networkidle');
    await page.getByText('The visitor claimed another coupon recently.').waitFor();
  });
});
