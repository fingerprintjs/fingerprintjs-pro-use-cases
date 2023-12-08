import { Page, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { COUPON_FRAUD_COPY } from '../src/pages/api/coupon-fraud/claim';

const insertCoupon = async (page: Page, coupon: string) => {
  await page.getByTestId(TEST_IDS.couponFraud.couponCode).fill(coupon);
};

const submitCoupon = async (page: Page) => {
  await page.getByTestId(TEST_IDS.couponFraud.submitCoupon).click();
};

test.describe('Coupon fraud', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/coupon-fraud');
    await resetScenarios(page);
  });

  test('should not allow to claim coupon that does not exist', async ({ page }) => {
    await insertCoupon(page, 'Does not exist');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.doesNotExist).waitFor();
  });

  test('should apply correct coupon only once', async ({ page }) => {
    await insertCoupon(page, 'Promo3000');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.success).waitFor();

    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.usedBefore).waitFor();
  });

  test('should prevent spamming multiple coupons', async ({ page }) => {
    await insertCoupon(page, 'Promo3000');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.success).waitFor();

    await insertCoupon(page, 'BlackFriday');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.usedAnotherCouponRecently).waitFor();
  });
});
