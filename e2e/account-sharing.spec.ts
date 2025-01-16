import { Page, expect, test } from '@playwright/test';
import { blockGoogleTagManager, assertAlert, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { ACCOUNT_SHARING_COPY, DEFAULT_USER } from '../src/app/account-sharing/const';

const TEST_ID = TEST_IDS.accountSharing;

const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

async function fillLoginForm(page: Page, username: string, password: string) {
  await page.getByTestId(TEST_ID.usernameInput).fill(username);
  await page.getByTestId(TEST_ID.passwordInput).fill(password);
}

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/account-sharing');
  //
});

test.describe('Account Sharing', () => {
  test('should allow signup with new credentials', async ({ page }) => {
    // Reset scenarios to ensure TEST_USER does not already exist
    await resetScenarios(page);

    const username = TEST_USER.username;
    const password = TEST_USER.password;

    await fillLoginForm(page, username, password);
    await page.getByTestId(TEST_ID.signUpButton).click();

    await expect(page).toHaveURL(`/account-sharing/home/${username}`);
    await assertAlert({
      page,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.loginSuccess(username),
    });
  });

  test('should prevent signup with existing username', async ({ page }) => {
    await fillLoginForm(page, TEST_USER.username, TEST_USER.password);
    await page.getByTestId(TEST_ID.signUpButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.userAlreadyExists,
    });
  });

  test('should allow login with correct credentials', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillLoginForm(page, TEST_USER.username, TEST_USER.password);
    await page.getByTestId(TEST_ID.loginButton).click();

    await expect(page).toHaveURL(`/account-sharing/home/${TEST_USER.username}`);
    await assertAlert({
      page,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.loginSuccess(TEST_USER.username),
    });
  });

  test('should prevent login with incorrect password', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillLoginForm(page, TEST_USER.username, 'wrongpass');
    await page.getByTestId(TEST_ID.loginButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.incorrectPassword,
    });
  });

  test('should prevent login with non-existent username', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillLoginForm(page, 'non-existent-username-1921r74289', 'whatever');
    await page.getByTestId(TEST_ID.loginButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.userNotFound,
    });
  });

  // TODO: should allow logging you out

  //   test('should detect login from another device', async ({ context }) => {
  //     // First login
  //     await fillLoginForm(page, 'user', 'fingerprint');
  //     await submitForm(page);
  //     await expect(page).toHaveURL('/account-sharing/home/user');

  //     // Try to login from "another device" (new tab)
  //     const newTab = await context.newPage();
  //     await newTab.goto('/account-sharing');
  //     await newTab.getByText('Log in').click();
  //     await fillLoginForm(newTab, 'user', 'fingerprint');
  //     await submitForm(newTab);

  //     await assertAlert({
  //       page: newTab,
  //       severity: 'error',
  //       text: 'It seems you are already logged in to this account from another device',
  //     });
  //   });

  //   test('should allow logout', async ({ page }) => {
  //     await page.getByText('Log in').click();
  //     await fillLoginForm(page, 'user', 'fingerprint');
  //     await submitForm(page);

  //     await page.getByRole('button', { name: 'Log out' }).click();
  //     await expect(page).toHaveURL('/account-sharing?mode=login&justLoggedOut=true');

  //     await assertAlert({
  //       page,
  //       severity: 'success',
  //       text: 'You have logged out.',
  //     });
  //   });
});
