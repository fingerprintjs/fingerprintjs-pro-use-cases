import { expect, test } from '@playwright/test';
import { TEST_ATTRIBUTES, TEST_IDS } from '../../src/client/testIDs';

// TODO Remove once fixed
test.skip(({ browserName }) => browserName == 'firefox', 'This test currently fails in Github CI on Firefox');

test.describe('Sending verification SMS messages', () => {
  test('is not possible as a bot with Bot detection on', async ({ page }) => {
    await page.goto('/sms-fraud');
    // await page.getByRole('heading', { name: 'Learn more' }).scrollIntoViewIfNeeded();
    await page.getByTestId(TEST_IDS.smsFraud.sendMessage).click();
    const alert = await page.getByTestId(TEST_IDS.common.alert);
    await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, 'error');
    await expect(alert).toContainText('Malicious bot detected');
  });
});
