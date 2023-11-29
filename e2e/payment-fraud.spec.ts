import { Page, test } from '@playwright/test';
import { resetScenarios } from './resetHelper';

async function waitForSuccessfulSubmit(page: Page) {
  await page.click('[type="submit"]');
  await page.waitForSelector('text="Thank you for your payment. Everything is OK."');
}

async function waitForInvalidCardSubmit(page: Page) {
  await page.click('[type="submit"]');
  await page.waitForSelector('text="Incorrect card details, try again."');
}

test.describe('Payment fraud', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/payment-fraud');
    await resetScenarios(page);
  });

  test('should pass payment with prefilled details', async ({ page }) => {
    await waitForSuccessfulSubmit(page);
  });

  test('should allow only two chargebacks', async ({ page }) => {
    await page.check('[name="applyChargeback"]');

    await waitForSuccessfulSubmit(page);
    await waitForSuccessfulSubmit(page);

    await page.click('[type="submit"]');

    await page.waitForSelector(
      'text="You performed more than 1 chargeback during the last 1 year, we did not perform the payment."',
    );
  });

  test('should prevent card cracking after 3 attempts', async ({ page }) => {
    await page.fill('[name="cardNumber"]', '4242 4242 4242 4243');

    await waitForInvalidCardSubmit(page);
    await waitForInvalidCardSubmit(page);
    await waitForInvalidCardSubmit(page);

    await page.click('[type="submit"]');
    await page.waitForSelector(
      'text="You placed more than 3 unsuccessful payment attempts during the last 365 days. This payment attempt was not performed."',
    );
  });

  test('should prevent purchase if card was flagged as stolen', async ({ page }) => {
    await page.check('[name="usingStolenCard"]');

    await waitForSuccessfulSubmit(page);

    await page.click('[type="submit"]');
    await page.waitForSelector(
      'text="According to our records, you paid with a stolen card. We did not process the payment."',
    );
  });
});
