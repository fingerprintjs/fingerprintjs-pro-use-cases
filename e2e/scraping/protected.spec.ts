import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/client/testIDs';

test.describe('Scraping flights', () => {
  test('is not possible with Bot detection on', async ({ page }) => {
    await page.goto('/web-scraping');
    await page.getByRole('button', { name: 'Search' }).click();
    const alert = await page.getByTestId(TEST_IDS.common.alert);
    expect(alert).toContainText('Malicious bot detected', {
      timeout: 10000,
    });
  });
});
