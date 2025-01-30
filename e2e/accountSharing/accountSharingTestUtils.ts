import { chromium, firefox, Page } from '@playwright/test';
import { UserDbModel, SessionDbModel } from '../../src/app/account-sharing/api/database';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { hashString } from '../../src/server/server-utils';
import { assertAlert, blockGoogleTagManager } from '../e2eTestUtils';
import { TEST_IDS } from '../../src/client/testIDs';
import { PRODUCTION_E2E_TEST_BASE_URL } from '../../src/envShared';
import { AccountSharingAdminPayload } from '../../src/app/account-sharing/api/admin/route';

const TEST_ID = TEST_IDS.accountSharing;

export const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

export const ensureTestUserExists = async () => {
  const { username, password } = TEST_USER;
  await UserDbModel.findOrCreate({
    where: { username },
    defaults: { username, passwordHash: hashString(password), createdWithVisitorId: '' },
  });
};

export const deleteTestUser = async () => {
  await UserDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const logOutTestUserEverywhere = async () => {
  await SessionDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const fillForm = async (page: Page, username: string, password: string) => {
  await page.getByTestId(TEST_ID.usernameInput).fill(username);
  await page.getByTestId(TEST_ID.passwordInput).fill(password);
};

export const logInAndAssertSuccess = async (page: Page) => {
  const { username, password } = TEST_USER;
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillForm(page, username, password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await page.waitForURL(`/account-sharing/home/${username}`);
  await assertAlert({
    page,
    severity: 'success',
    text: ACCOUNT_SHARING_COPY.loginSuccess(username),
  });
};

export const logInAndAssertChallenge = async (page: Page) => {
  const { username, password } = TEST_USER;
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillForm(page, username, password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await assertAlert({
    page,
    severity: 'error',
    text: ACCOUNT_SHARING_COPY.alreadyLoggedIn,
  });
};

export const logOutAndAssertSuccess = async (page: Page) => {
  await page.getByTestId(TEST_ID.logoutButton).click();
  await page.waitForURL('/account-sharing?mode=login&justLoggedOut=true');

  await assertAlert({
    page,
    severity: 'success',
    text: ACCOUNT_SHARING_COPY.logoutSuccess,
  });
};

export const getTwoBrowsers = async () => {
  const chromeBrowser = await chromium.launch();
  const firefoxBrowser = await firefox.launch();

  const chromeContext = await chromeBrowser.newContext();
  const firefoxContext = await firefoxBrowser.newContext({
    permissions: [],
  });

  const chromePage = await chromeContext.newPage();
  const firefoxPage = await firefoxContext.newPage();

  // Block GTM on both pages
  await blockGoogleTagManager(chromePage);
  await blockGoogleTagManager(firefoxPage);

  return {
    chromePage,
    firefoxPage,
    cleanUp: async () => {
      await chromeBrowser.close();
      await firefoxBrowser.close();
    },
  };
};

/**
 * Production E2E test utils actions
 */
export const productionE2eTestActions = {
  ensureTestUserExists,
  deleteTestUser,
  logOutTestUserEverywhere,
} as const;
export type ProductionE2eTestActionName = keyof typeof productionE2eTestActions;
export const sendProductionE2eTestActionRequest = async (action: ProductionE2eTestActionName) => {
  const url = PRODUCTION_E2E_TEST_BASE_URL;
  if (!url) {
    throw new Error('Production E2E test base URL is not set');
  }
  const response = await fetch(`${url}/account-sharing/api/admin`, {
    method: 'POST',
    body: JSON.stringify({ action, e2eTestToken: env.E2E_TEST_TOKEN } satisfies AccountSharingAdminPayload),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to perform E2E test action '${action}' on production URL: ${url}: ${response.status} ${response.statusText}`,
    );
  }
};

export const testUtilsAction = async (action: ProductionE2eTestActionName) => {
  if (PRODUCTION_E2E_TEST_BASE_URL) {
    await sendProductionE2eTestActionRequest(action);
  } else {
    await productionE2eTestActions[action]();
  }
};
