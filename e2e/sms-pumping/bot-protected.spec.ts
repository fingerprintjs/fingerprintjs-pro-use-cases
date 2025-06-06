import { test } from '@playwright/test';
import { TEST_IDS } from '../../src/client/testIDs';
import { assertAlert, blockGoogleTagManager } from '../e2eTestUtils';

// TODO Remove once fixed
test.skip(({ browserName }) => browserName == 'firefox', 'This test currently fails in Github CI on Firefox');

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
});

test.describe('Sending verification SMS messages', () => {
  test('is not possible as a bot with Bot detection on', async ({ page }) => {
    await page.goto('/sms-pumping', { waitUntil: 'networkidle' });
    await page.getByTestId(TEST_IDS.smsFraud.sendMessage).click();
    await assertAlert({ page, severity: 'error', text: 'Malicious bot detected' });
  });
});
