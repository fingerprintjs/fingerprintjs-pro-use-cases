import { Page, test } from '@playwright/test';
import { blockGoogleTagManager, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { PAYMENT_FRAUD_COPY } from '../src/app/payment-fraud/api/place-order/copy';

const submit = (page: Page) => page.getByTestId(TEST_IDS.paymentFraud.submitPayment).click();

async function waitForSuccessfulSubmit(page: Page) {
  await submit(page);
  await page.getByText(PAYMENT_FRAUD_COPY.successfulPayment).waitFor();
}

async function waitForInvalidCardSubmit(page: Page) {
  await submit(page);
  await page.getByText(PAYMENT_FRAUD_COPY.incorrectCardDetails).waitFor();
}

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/payment-fraud');
  await resetScenarios(page);
});

test.describe('Payment fraud', () => {
  test('should pass payment with prefilled details', async ({ page }) => {
    await waitForSuccessfulSubmit(page);
  });

  test('should allow only two chargebacks', async ({ page }) => {
    await page.getByTestId(TEST_IDS.paymentFraud.askForChargeback).check();
    await waitForSuccessfulSubmit(page);
    await waitForSuccessfulSubmit(page);

    await submit(page);
    await page.getByText(PAYMENT_FRAUD_COPY.previousChargeback).waitFor();
  });

  test('should prevent card cracking after 3 attempts', async ({ page }) => {
    await page.getByTestId(TEST_IDS.paymentFraud.cardNumber).fill('4242 4242 4242 4243');
    await waitForInvalidCardSubmit(page);
    await waitForInvalidCardSubmit(page);
    await waitForInvalidCardSubmit(page);

    await submit(page);
    await page.getByText(PAYMENT_FRAUD_COPY.tooManyUnsuccessfulPayments).waitFor();
  });

  test('should prevent another purchase if card was flagged as stolen', async ({ page }) => {
    await page.getByTestId(TEST_IDS.paymentFraud.usingStolenCard).check();
    await waitForSuccessfulSubmit(page);

    await submit(page);
    await page.getByText(PAYMENT_FRAUD_COPY.stolenCard).waitFor();
  });
});
