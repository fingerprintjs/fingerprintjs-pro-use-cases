// @ts-check
import { expect, test } from '@playwright/test';
import { getWebsiteUrl } from './url';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto(getWebsiteUrl().toString());

    const cards = await page.locator('.UseCase');

    expect(await cards.count()).toBeGreaterThan(1);
  });
});
