import { test, expect } from '@playwright/test';
import { assertAlert, blockAds, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { PAYWALL_COPY } from '../src/server/paywall/paywallCopy';

test.describe('Paywall', () => {
  test.beforeEach(async ({ page }) => {
    await blockAds(page);
    await page.goto('/paywall');
    await resetScenarios(page);
  });

  test('Should show two articles, then show a paywall', async ({ page }) => {
    const articles = await page.getByTestId(TEST_IDS.paywall.articleCard);

    await articles.first().click();
    await assertAlert({ page, text: PAYWALL_COPY.nArticlesRemaining(1), severity: 'warning' });
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(1).click();
    await assertAlert({ page, text: PAYWALL_COPY.lastArticle, severity: 'warning' });
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeVisible();
    await page.goBack();

    await articles.nth(2).click();
    await assertAlert({ page, text: PAYWALL_COPY.limitReached, severity: 'error' });
    await expect(page.getByTestId(TEST_IDS.paywall.articleContent)).toBeHidden();
  });
});
