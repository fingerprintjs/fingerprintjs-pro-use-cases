import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/client/testIDs';

test.describe('Scraping flights', () => {
  test('is not possible with Bot detection on', async ({ page }) => {
    await page.goto('/web-scraping', { waitUntil: 'networkidle' });
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');
  });
});
