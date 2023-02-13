// @ts-check
import { test } from '@playwright/test';
import { reset } from './admin';

test.describe('Paywall', () => {
  test.beforeEach(async ({ page, context }) => {
    await reset(context);

    await page.goto('/paywall');
  });

  test('should show how many free views remain', async ({ page }) => {
    const articles = await page.locator('.article-link');

    await articles.first().click();
    await page.waitForSelector('text="You have 1 remaining free article views."');

    await page.goBack();
    await articles.nth(1).click();
    await page.waitForSelector('text="You have exceeded your free daily article views."');

    await page.goBack();
    await articles.first().click();
    await page.waitForSelector('text="You have exceeded your free daily article views."');
  });

  test('should show paywall after passing limit', async ({ page }) => {
    const articles = await page.locator('.article-link');

    await articles.first().click();
    await page.waitForSelector('.UsecaseWrapper_alert');
    await page.goBack();

    await articles.nth(1).click();
    await page.waitForSelector('.UsecaseWrapper_alert');
    await page.goBack();

    await articles.nth(2).click();
    await page.waitForSelector(
      'text="You have reached your daily view limit, purchase our membership plan to view unlimited articles."'
    );
  });
});
