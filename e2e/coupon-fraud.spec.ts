import { Page, test, expect } from '@playwright/test';
import { blockGoogleTagManager, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { COUPON_FRAUD_COPY } from '../src/app/coupon-fraud/api/claim/copy';

const insertCoupon = async (page: Page, coupon: string) => {
  await page.getByTestId(TEST_IDS.couponFraud.couponCode).fill(coupon);
};

const submitCoupon = async (page: Page) => {
  await page.getByTestId(TEST_IDS.couponFraud.submitCoupon).click();
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/coupon-fraud');
  await resetScenarios(page);
});

test.describe('Coupon fraud', () => {
  test('should not allow to claim coupon that does not exist', async ({ page }) => {
    await insertCoupon(page, 'Does not exist');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.doesNotExist).waitFor();
    await expect(page.getByTestId(TEST_IDS.common.cart.discount)).toBeAttached({ attached: false });
  });

  test('should apply correct coupon only once', async ({ page }) => {
    await insertCoupon(page, 'Promo3000');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.success).waitFor();
    await page.getByTestId(TEST_IDS.common.cart.discount);

    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.usedBefore).waitFor();
  });

  test('should prevent spamming multiple coupons', async ({ page }) => {
    await insertCoupon(page, 'Promo3000');
    await submitCoupon(page);
    await page.getByTestId(TEST_IDS.common.cart.discount);
    await page.getByText(COUPON_FRAUD_COPY.success).waitFor();

    await insertCoupon(page, 'BlackFriday');
    await submitCoupon(page);
    await page.getByText(COUPON_FRAUD_COPY.usedAnotherCouponRecently).waitFor();
  });
});
