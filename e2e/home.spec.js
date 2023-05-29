// @ts-check
import { expect, test } from '@playwright/test';
import { TILE_TAG } from '../client/components/PageTile';

test.describe('Home page', () => {
  test('should list cards with use-cases', async ({ page }) => {
    await page.goto('/');

    const cards = await page.locator(`[data-test="${TILE_TAG.useCaseTitle}"]`);

    expect(await cards.count()).toBeGreaterThan(1);
  });
});
