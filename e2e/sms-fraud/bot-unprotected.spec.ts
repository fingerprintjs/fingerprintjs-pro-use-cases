import { expect, test } from '@playwright/test';
import { TEST_ATTRIBUTES, TEST_IDS } from '../../src/client/testIDs';
import { SMS_FRAUD_COPY } from '../../src/server/sms-fraud/smsFraudCopy';
import { TEST_PHONE_NUMBER } from '../../src/pages/api/sms-fraud/send-verification-sms';
import { assertAlert, assertSnackbar, resetScenarios } from '../e2eTestUtils';

const TEST_ID = TEST_IDS.smsFraud;

// This test includes waiting for the SMS cool-down period, so it will take longer
test.setTimeout(60000);

test.describe('Sending verification SMS messages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/sms-fraud?disableBotDetection=1');
    await resetScenarios(page);
  });

  test('is possible with Bot detection off, with cool down periods', async ({ page }) => {
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);

    await sendButton.click();
    await assertAlert({ page, severity: 'success', text: SMS_FRAUD_COPY.messageSent(TEST_PHONE_NUMBER, 2) });

    await sendButton.click();
    await assertAlert({ page, severity: 'error', text: SMS_FRAUD_COPY.needToWait(1) });

    await page.waitForTimeout(30000);
    await sendButton.click();
    await assertAlert({ page, severity: 'success', text: SMS_FRAUD_COPY.messageSent(TEST_PHONE_NUMBER, 1) });

    await sendButton.click();
    await assertAlert({ page, severity: 'error', text: SMS_FRAUD_COPY.needToWait(2) });
  });

  test.only('allows user to create an account with the correct code', async ({ page }) => {
    const sendButton = await page.getByTestId(TEST_ID.sendMessage);
    await sendButton.click();
    await assertAlert({ page, severity: 'success', text: SMS_FRAUD_COPY.messageSent(TEST_PHONE_NUMBER, 2) });

    await assertSnackbar({ page, severity: 'info', text: 'Your verification code is' });
    await page.getByTestId(TEST_IDS.smsFraud.copyCodeButton).click();

    const code =
      (await page.getByTestId(TEST_IDS.smsFraud.codeInsideSnackbar).textContent()) ?? 'Code not found in snackbar';

    const clipboardAvailable = await page.evaluate(
      () => Boolean(navigator.clipboard) && 'readText' in navigator.clipboard,
    );
    if (clipboardAvailable) {
      const codeInClipboard = await page.evaluate(() => navigator.clipboard.readText());
      console.log('Code in clipboard: ', codeInClipboard);
      expect(codeInClipboard).toEqual(code);
    }

    await page.getByTestId(TEST_IDS.smsFraud.codeInput).fill(code);
    await page.getByTestId(TEST_IDS.smsFraud.sendCode).click();
    await assertAlert({ page, severity: 'success', text: SMS_FRAUD_COPY.accountCreated, index: 1 });
  });
});
