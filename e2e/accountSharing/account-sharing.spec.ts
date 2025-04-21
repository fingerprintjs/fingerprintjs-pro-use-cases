import { expect, test } from '@playwright/test';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { TEST_IDS } from '../../src/client/testIDs';
import {
  assertAlert,
  assertAlertNotPresent,
  blockGoogleTagManager,
  resetScenarios,
  scrollDemoIntoView,
} from '../e2eTestUtils';
import {
  TEST_USER,
  fillForm,
  logInAndAssertSuccess,
  logInAndAssertChallenge,
  getTwoBrowsers,
  logOutAndAssertSuccess,
  testUtilsAction,
} from './accountSharingTestUtils';

const TEST_ID = TEST_IDS.accountSharing;

test.describe('Account Sharing - single browser tests', () => {
  test.beforeEach(async ({ page }) => {
    await testUtilsAction('ensureTestUserExists');
    await testUtilsAction('logOutTestUserEverywhere');
    await blockGoogleTagManager(page);
    await page.goto('/account-sharing', { waitUntil: 'networkidle' });
    await scrollDemoIntoView(page);
  });

  test('should allow signup with new credentials', async ({ page }) => {
    // For this one test, we need the test user not to exist
    await testUtilsAction('deleteTestUser');
    const { username, password } = TEST_USER;

    await fillForm(page, username, password);
    await page.getByTestId(TEST_ID.signUpButton).click();

    await page.waitForURL(`/account-sharing/home/${username}`);
    await assertAlert({
      page,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.loginSuccess(username),
    });
  });

  test('should prevent signup with existing username', async ({ page }) => {
    await fillForm(page, TEST_USER.username, TEST_USER.password);
    await page.getByTestId(TEST_ID.signUpButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.userAlreadyExists,
    });
  });

  test('should allow login with correct credentials', async ({ page }) => {
    await logInAndAssertSuccess(page);
  });

  test('should let users log out', async ({ page }) => {
    await logInAndAssertSuccess(page);
    await logOutAndAssertSuccess(page);
  });

  test('should prevent login with incorrect password', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillForm(page, TEST_USER.username, 'wrongpass');
    await page.getByTestId(TEST_ID.loginButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.incorrectPassword,
    });
  });

  test('should prevent login with non-existent username', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await fillForm(page, 'non-existent-username-1921r74289', 'whatever');
    await page.getByTestId(TEST_ID.loginButton).click();

    await assertAlert({
      page,
      severity: 'error',
      text: ACCOUNT_SHARING_COPY.userNotFound,
    });
  });

  test('Going to homepage when logged out should redirect to login page', async ({ page }) => {
    await page.goto(`/account-sharing/home/${TEST_USER.username}`, { waitUntil: 'load' });
    await page.waitForURL('/account-sharing?mode=login');
    await expect(page.getByTestId(TEST_ID.loginButton)).toBeVisible();
  });

  test('should allow switching between signup and login', async ({ page }) => {
    await page.getByTestId(TEST_ID.switchToLoginButton).click();
    await page.waitForURL('/account-sharing?mode=login');
    await expect(page.getByTestId(TEST_ID.loginButton)).toBeVisible();

    await page.getByTestId(TEST_ID.switchToSignUpButton).click();
    await page.waitForURL('/account-sharing?mode=signup');
    await expect(page.getByTestId(TEST_ID.signUpButton)).toBeVisible();
  });

  test('should reset toasts after reloading the page', async ({ page }) => {
    await page.goto('/account-sharing?mode=login&justLoggedOut=true');
    await assertAlert({ page, severity: 'success', text: ACCOUNT_SHARING_COPY.logoutSuccess });
    await page.reload();
    await assertAlertNotPresent({ page, severity: 'success', text: ACCOUNT_SHARING_COPY.logoutSuccess });
  });

  test('should reset toasts after resetting scenarios', async ({ page }) => {
    await page.goto('/account-sharing?mode=login&justLoggedOut=true');
    await assertAlert({ page, severity: 'success', text: ACCOUNT_SHARING_COPY.logoutSuccess });
    await resetScenarios(page);
    await assertAlertNotPresent({ page, severity: 'success', text: ACCOUNT_SHARING_COPY.logoutSuccess });
  });
});

test.describe('Account Sharing - multi-browser tests', () => {
  /**
   * Only run these tests in the Chrome e2e branch
   * These tests already use multiple browsers (Chrome and Firefox), it's sufficient to run them once.
   */
  test.skip(({ browserName }) => browserName !== 'chromium', 'Multi-browser by nature');

  test.beforeEach(async () => {
    await testUtilsAction('ensureTestUserExists');
    await testUtilsAction('logOutTestUserEverywhere');
  });

  test('Should prevent two browsers from logging in to the same account at the same time', async () => {
    const { chromePage, firefoxPage, cleanUp } = await getTwoBrowsers();
    await chromePage.goto('/account-sharing');
    await firefoxPage.goto('/account-sharing');

    // Log in with Chrome first
    await logInAndAssertSuccess(chromePage);

    // Try to log in with Firefox
    await logInAndAssertChallenge(firefoxPage);

    // On Firefox, give up and go back to the login page
    await firefoxPage.getByTestId(TEST_ID.challengeGoBackButton).click();
    await firefoxPage.waitForURL('/account-sharing?mode=login');
    await expect(firefoxPage.getByTestId(TEST_ID.loginButton)).toBeVisible();

    // Clean up
    await cleanUp();
  });

  test('Force log in with a second browser logs you out of the first', async () => {
    const { chromePage, firefoxPage, cleanUp } = await getTwoBrowsers();
    await chromePage.goto('/account-sharing');
    await firefoxPage.goto('/account-sharing');

    // Log in with Chrome first
    await logInAndAssertSuccess(chromePage);

    // Try to log in with Firefox
    await logInAndAssertChallenge(firefoxPage);

    // Force log in with Firefox
    await firefoxPage.getByTestId(TEST_ID.forceLoginButton).click();

    // Firefix login should be successful
    await firefoxPage.waitForURL(`/account-sharing/home/${TEST_USER.username}`);
    await assertAlert({
      page: firefoxPage,
      severity: 'success',
      text: ACCOUNT_SHARING_COPY.loginSuccess(TEST_USER.username),
    });

    // Scroll demo into view just in case for easier debugging
    await firefoxPage.getByTestId(TEST_ID.logoutButton).scrollIntoViewIfNeeded();
    await chromePage.getByTestId(TEST_ID.usernameInput).scrollIntoViewIfNeeded();

    // Chrome is logged out
    await chromePage.waitForURL('/account-sharing?mode=login');
    await assertAlert({
      page: chromePage,
      severity: 'warning',
      text: ACCOUNT_SHARING_COPY.youWereLoggedOut,
    });

    // Clean up
    await cleanUp();
  });
});
