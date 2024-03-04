import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../../src/client/testIDs';

// TODO Remove once fixed
test.skip(({ browserName }) => browserName == 'firefox', 'This test currently fails in Github CI on Firefox');

test.describe('Scraping flights', () => {
  test('is not possible with Bot detection on', async ({ page }) => {
    await page.goto('/web-scraping');
    await page.getByRole('heading', { name: 'Learn more' }).scrollIntoViewIfNeeded();
    await expect(page.getByTestId(TEST_IDS.common.alert)).toContainText('Malicious bot detected');
  });
});
