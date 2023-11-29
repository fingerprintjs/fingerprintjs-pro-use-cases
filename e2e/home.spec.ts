import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto('/');
    const cards = await page.getByTestId(TEST_IDS.homepageCard.useCaseTitle);
    expect(await cards.count()).toBeGreaterThan(5);
  });
});
