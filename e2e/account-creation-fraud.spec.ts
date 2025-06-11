import { Page, test, expect, Locator } from '@playwright/test';
import { blockGoogleTagManager, resetScenarios } from './e2eTestUtils';

const UNEXPECTED_ERROR_TEXT = 'Failed to create a trial account due to an unexpected error.';

const getCreateTrialAccountButton = (page: Page): Locator => {
  return page.getByRole('button', { name: 'Create trial account' });
};

const submitCreateTrialAccount = async (page: Page) => {
  await getCreateTrialAccountButton(page).click();
};

const submitGoBack = async (page: Page) => {
  await page.getByRole('button', { name: 'Go back' }).click();
};

const enterUsername = async (page: Page, username: string) => {
  await page.getByLabel('Username').fill(username);
};

const enterPassword = async (page: Page, password: string) => {
  await page.getByLabel('Password').fill(password);
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/account-creation-fraud');
  await resetScenarios(page);
});

test.describe('Account Creation Fraud', () => {
  test('should prevent form submission when username and password not entered', async ({ page }) => {
    await submitCreateTrialAccount(page);
    await expect(page.getByLabel('Username').and(page.locator(':invalid'))).toBeFocused();

    await enterUsername(page, 'user1');
    await submitCreateTrialAccount(page);

    await expect(page.getByLabel('Password').and(page.locator(':invalid'))).toBeFocused();
  });

  test('should only allow one account creation', async ({ page }) => {
    await enterUsername(page, 'user1');
    await enterPassword(page, 'password');
    await submitCreateTrialAccount(page);

    await expect(page.getByRole('heading', { name: 'Welcome to your free trial' })).toBeVisible();
    await submitGoBack(page);

    await enterUsername(page, 'user2');
    await enterPassword(page, 'password');
    await submitCreateTrialAccount(page);

    await expect(
      page.getByText('It looks like you have already created a free trial account using this browser.'),
    ).toBeVisible();
    await expect(getCreateTrialAccountButton(page)).toBeDisabled();
  });

  test('should gracefully handle an unexpected 502 response status code', async ({ page }) => {
    await page.route('**/account-creation-fraud/api/create-account', (route) =>
      route.fulfill({
        json: {
          severity: 'Error',
          message: 'Unspecified',
        },
        status: 502,
      }),
    );

    await enterUsername(page, 'user1');
    await enterPassword(page, 'password');
    await submitCreateTrialAccount(page);

    await expect(page.getByText(UNEXPECTED_ERROR_TEXT)).toBeVisible();
  });

  test('should gracefully handle an unexpected 400 response status code', async ({ page }) => {
    await page.route('**/account-creation-fraud/api/create-account', (route) => {
      const postData = route.request().postDataJSON();
      delete postData.username;
      route.continue({ postData });
    });

    await enterUsername(page, 'user1');
    await enterPassword(page, 'password');
    await submitCreateTrialAccount(page);

    await expect(page.getByText(UNEXPECTED_ERROR_TEXT)).toBeVisible();
  });

  test('should be available as an embeddable page', async ({ page }) => {
    await page.goto('/account-creation-fraud/embed');
    await expect(page.getByRole('heading', { name: 'Account Creation Fraud Prevention Test', level: 1 })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).not.toBeVisible();
  });
});
