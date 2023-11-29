import { test, expect } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';

test.describe('Paywall', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/paywall');
    await resetScenarios(page);
  });

  test('Should show two articles, then show a paywall', async ({ page }) => {
    const articles = await page.getByTestId(TEST_IDS.paywall.articleCard);

    await articles.first().click();
    await page.getByText('You have 1 remaining free article views.').waitFor();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(1).click();
    await page.getByText('This is your last free article today.').waitFor();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(2).click();
    await expect(
      page.getByText(
        'You have reached your daily view limit, purchase our membership plan to view unlimited articles.',
      ),
    ).toBeVisible();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeHidden();
  });
});
