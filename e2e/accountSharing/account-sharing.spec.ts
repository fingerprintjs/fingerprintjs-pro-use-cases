import { chromium, expect, firefox, test } from '@playwright/test';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { TEST_IDS } from '../../src/client/testIDs';
import { assertAlert, blockGoogleTagManager } from '../e2eTestUtils';
import {
  ensureTestUserNotLoggedInAnywhere,
  ensureTestUserExists,
  deleteTestUser,
  logInTestUser,
  TEST_USER,
  fillLoginForm,
} from './accountSharingTestUtils';

const TEST_ID = TEST_IDS.accountSharing;

test.describe('Account Sharing - single browser tests', () => {
  test.beforeEach(async ({ page }) => {
    await ensureTestUserExists();
    await ensureTestUserNotLoggedInAnywhere();
    await blockGoogleTagManager(page);
    await page.goto('/account-sharing');
  });

  test('should allow signup with new credentials', async ({ page }) => {
    // Reset scenarios to ensure TEST_USER does not already exist
    await deleteTestUser();

    const username = TEST_USER.username;
    const password = TEST_USER.password;

    await fillLoginForm(page, username, password);
    await page.getByTestId(TEST_ID.signUpButton).click();

    await page.waitForURL(`/account-sharing/home/${username}`);
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
});

const getTwoBrowsers = async () => {
  const chromeBrowser = await chromium.launch();
  const firefoxBrowser = await firefox.launch();

  const chromeContext = await chromeBrowser.newContext();
  const firefoxContext = await firefoxBrowser.newContext({
    permissions: [],
  });

  const chromePage = await chromeContext.newPage();
  const firefoxPage = await firefoxContext.newPage();

  return {
    chromePage,
    firefoxPage,
    cleanUp: async () => {
      await chromeBrowser.close();
      await firefoxBrowser.close();
    },
  };
};

test.describe('Account Sharing - multi-browser tests', () => {
  test.beforeEach(async () => {
    await ensureTestUserExists();
    await ensureTestUserNotLoggedInAnywhere();
  });

  test('Should prevent two browsers from logging in to the same account at the same time', async () => {
    const { chromePage, firefoxPage, cleanUp } = await getTwoBrowsers();

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

    // Give up and go back to the login page
    await firefoxPage.getByTestId(TEST_ID.challengeGoBackButton).click();
    await firefoxPage.waitForURL('/account-sharing?mode=login');
    await expect(firefoxPage.getByTestId(TEST_ID.loginButton)).toBeVisible();

    // Clean up
    await chromePage.getByTestId(TEST_ID.logoutButton).click();
    await cleanUp();
  });

  test('Force log in with a second browser logs you out of the first', async () => {
    const { chromePage, firefoxPage, cleanUp } = await getTwoBrowsers();

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

    // Force log in
    await firefoxPage.getByTestId(TEST_ID.forceLoginButton).click();

    // Firefix login successful
    await firefoxPage.waitForURL(`/account-sharing/home/${TEST_USER.username}`);
    await assertAlert({
      page: firefoxPage,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.loginSuccess(TEST_USER.username),
    });

    // Chrome is logged out
    await chromePage.waitForURL('/account-sharing?mode=login&justLoggedOut=true**');
    await assertAlert({
      page: chromePage,
      severity: 'warning',
      text: ACCOUNT_SHARING_COPY.youWereLoggedOut,
    });

    // Clean up
    await cleanUp();
  });
});
