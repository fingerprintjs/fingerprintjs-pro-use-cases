// @ts-check
import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto('/');

    const cards = await page.locator('.UseCase');

    expect(await cards.count()).toBeGreaterThan(1);
  });
});
