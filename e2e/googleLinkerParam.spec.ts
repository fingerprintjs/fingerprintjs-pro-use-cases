import { expect, test } from '@playwright/test';
import { blockGoogleTagManager } from './e2eTestUtils';

const GL_VALUE = '1*1abc2de*_ga*MTIzNDU2Nzg5LjE3NTI2ODEyMzQ.*_ga_ABCDEF1234*czE3NTI2ODEyMzQkbzEkZzAkajYw';

/**
 * Waiting for the Google tag to settle takes an identification round trip, which is more
 * than the default `expect` timeout allows for.
 */
const REMOVAL_TIMEOUT = 20000;

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
});

test.describe('Google Analytics linker parameter', () => {
  test('is removed from the URL after the page loads', async ({ page }) => {
    await page.goto(`/?${new URLSearchParams({ _gl: GL_VALUE })}`);

    await expect(page).toHaveURL('/', { timeout: REMOVAL_TIMEOUT });
  });

  test('is removed from a use case URL without dropping the other query parameters', async ({ page }) => {
    await page.goto(`/paywall?${new URLSearchParams({ _gl: GL_VALUE, utm_source: 'blog' })}`);

    await expect(page).toHaveURL('/paywall?utm_source=blog', { timeout: REMOVAL_TIMEOUT });
  });
});
