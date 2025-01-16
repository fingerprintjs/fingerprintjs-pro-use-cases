import { Page, chromium, expect, firefox, test } from '@playwright/test';
import { blockGoogleTagManager, assertAlert, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { ACCOUNT_SHARING_COPY } from '../src/app/account-sharing/const';

const TEST_ID = TEST_IDS.accountSharing;

const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

async function logInTestUser(page: Page) {
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillLoginForm(page, TEST_USER.username, TEST_USER.password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await page.waitForURL(`/account-sharing/home/${TEST_USER.username}`);
  await assertAlert({
    page,
    severity: 'success',
    text: ACCOUNT_SHARING_COPY.loginSuccess(TEST_USER.username),
  });
}

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
    await logInTestUser(page);
  });

  test('should let users log out', async ({ page }) => {
    await logInTestUser(page);

    await page.getByTestId(TEST_ID.logoutButton).click();
    await page.waitForURL('/account-sharing?mode=login&justLoggedOut=true');

    await assertAlert({
      page,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.logoutSuccess,
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

  test('Should prevent two browsers from logging in to the same accoutn at the same time', async () => {
    const chromeBrowser = await chromium.launch();
    const firefoxBrowser = await firefox.launch();

    const chromeContext = await chromeBrowser.newContext();
    const firefoxContext = await firefoxBrowser.newContext({
      permissions: [],
    });

    const chromePage = await chromeContext.newPage();
    const firefoxPage = await firefoxContext.newPage();

    await chromePage.goto('/account-sharing');

    // Log in with Chrome first
    await logInTestUser(chromePage);

    // Try to log in with Firefox
    await firefoxPage.goto('/account-sharing');
    await firefoxPage.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillLoginForm(firefoxPage, TEST_USER.username, TEST_USER.password);
    await firefoxPage.getByTestId(TEST_ID.loginButton).click();

    await assertAlert({
      page: firefoxPage,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.alreadyLoggedIn,
    });

    // Clean up
    await chromeBrowser.close();
    await firefoxBrowser.close();
  });
});
