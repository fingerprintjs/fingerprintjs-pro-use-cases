import { chromium, firefox, Page } from '@playwright/test';
import { AccountSharingAdminPayload } from '../../src/app/account-sharing/api/admin/route';
import {
  productionE2eTestActions,
  ProductionE2eTestActionName,
  TEST_USER,
} from '../../src/app/account-sharing/api/admin/productionE2eTestActions';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { TEST_IDS } from '../../src/client/testIDs';
import { E2E_TEST_TOKEN, PRODUCTION_E2E_TEST_BASE_URL } from '../../src/envShared';
import { assertAlert, blockGoogleTagManager } from '../e2eTestUtils';

export { productionE2eTestActions, TEST_USER };
export type { ProductionE2eTestActionName };

const TEST_ID = TEST_IDS.accountSharing;

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

export const sendProductionE2eTestActionRequest = async (action: ProductionE2eTestActionName) => {
  const url = PRODUCTION_E2E_TEST_BASE_URL;
  if (!url) {
    throw new Error('Production E2E test base URL is not set');
  }
  const response = await fetch(`${url}/account-sharing/api/admin`, {
    method: 'POST',
    body: JSON.stringify({ action, e2eTestToken: E2E_TEST_TOKEN } satisfies AccountSharingAdminPayload),
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
