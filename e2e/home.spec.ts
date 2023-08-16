import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../src/client/e2eTestIDs';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto('/');

    const cards = await page.locator(`[data-test="${TEST_IDS.homepageCard.useCaseTitle}"]`);

    expect(await cards.count()).toBeGreaterThan(5);
  });
});
