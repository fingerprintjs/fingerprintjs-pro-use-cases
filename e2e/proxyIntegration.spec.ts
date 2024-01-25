import { test } from '@playwright/test';
import { clickPlaygroundRefreshButton } from './playground.spec';

test.describe('Proxy integration', () => {
  test('Proxy integration works on Playground, no network errors', async ({ page }) => {
    // If any network request fails, fails the test
    // This captures proxy integration failures that would otherwise go unnoticed thanks to default endpoint fallbacks
    page.on('requestfailed', (request) => {
      throw new Error(request.url() + ' ' + request?.failure()?.errorText);
    });

    await page.goto('/playground');
    await clickPlaygroundRefreshButton(page);
    await page.waitForLoadState('networkidle');
  });
});
