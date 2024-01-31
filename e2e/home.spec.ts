import { expect, test } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto('/');
    const cards = await page.getByTestId(TEST_IDS.homepageCard.useCaseTitle);
    expect(await cards.count()).toBeGreaterThan(5);
  });

  test('Entire cards should be clickable, clicking on the description or image should take you to the use case', async ({
    page,
  }) => {
    await page.goto('/');

    await page.getByTestId(TEST_IDS.homepageCard.useCaseDescription).first().click({ force: true });
    await expect(page).toHaveURL('/playground');
    await page.goBack();

    await page.getByTestId(TEST_IDS.homepageCard.useCaseIcon).first().click({ force: true });
    await expect(page).toHaveURL('/playground');
  });
});
