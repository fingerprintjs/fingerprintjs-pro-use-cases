import { test } from '@playwright/test';
import { resetScenarios } from './resetHelper';

test.describe('Credential stuffing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/credential-stuffing');
    await resetScenarios(page);
  });

  test('should prevent login even with correct credentials', async ({ page }) => {
    await page.click('[type="submit"]');

    await page.waitForSelector(
      'text="Provided credentials are correct but we\'ve never seen you logging in using this device. Confirm your identity with a second factor."',
    );
  });

  test('should lock user after 5 invalid login attempts', async ({ page }) => {
    const submitForm = async () => {
      await page.click('[type="submit"]');
      await page.waitForSelector('text=Log in');
    };

    await page.fill('[name="password"]', 'wrong-password');

    // 6 attempts, last one should be blocked
    for (let i = 0; i < 7; i++) {
      await submitForm();
    }

    await page.waitForSelector(
      'text="You had more than 5 attempts during the last 24 hours. This login attempt was not performed."',
    );
  });
});
