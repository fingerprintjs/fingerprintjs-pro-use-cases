import { test } from '@playwright/test';
import { reset } from './admin';
import { TEST_IDS } from '../src/client/e2eTestIDs';

test.describe('Paywall', () => {
  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    await page.goto('/paywall');
  });

  test('should show how many free views remain', async ({ page }) => {
    const articles = await page.getByTestId(TEST_IDS.paywall.articleCard);

    await articles.first().click();
    await page.waitForSelector('text="You have 1 remaining free article views."');

    await page.goBack();
    await articles.nth(1).click();
    await page.waitForSelector('text="This is your last free article today."');
  });

  test('should show paywall after passing limit', async ({ page }) => {
    const articles = await page.getByTestId(TEST_IDS.paywall.articleCard);

    await articles.first().click();
    await page.waitForLoadState('networkidle');
    await page.goBack();

    await articles.nth(1).click();
    await page.waitForLoadState('networkidle');
    await page.goBack();

    await articles.nth(2).click();
    await page.waitForSelector(
      'text="You have reached your daily view limit, purchase our membership plan to view unlimited articles."',
    );
  });
});
