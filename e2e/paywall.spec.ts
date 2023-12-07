import { test, expect } from '@playwright/test';
import { resetScenarios } from './resetHelper';
import { TEST_IDS } from '../src/client/testIDs';
import { PAYWALL_COPY } from '../src/server/paywall/paywallCopy';

test.describe('Paywall', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/paywall');
    await resetScenarios(page);
  });

  test('Should show two articles, then show a paywall', async ({ page }) => {
    const articles = await page.getByTestId(TEST_IDS.paywall.articleCard);

    await articles.first().click();
    await page.getByText(PAYWALL_COPY.nArticlesRemaining(1)).waitFor();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(1).click();
    await page.getByText(PAYWALL_COPY.lastArticle).waitFor();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(2).click();

    await page.getByText(PAYWALL_COPY.limitReached).waitFor();
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeHidden();
  });
});
