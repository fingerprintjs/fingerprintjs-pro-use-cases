import { Page } from '@playwright/test';
import { UserDbModel, DeviceDbModel } from '../../src/app/account-sharing/api/database';
import { ACCOUNT_SHARING_COPY } from '../../src/app/account-sharing/const';
import { hashString } from '../../src/server/server-utils';
import { assertAlert } from '../e2eTestUtils';
import { TEST_IDS } from '../../src/client/testIDs';

const TEST_ID = TEST_IDS.accountSharing;

export const TEST_USER = {
  username: 'e2eTestUser',
  password: 'e2eTestPassword',
};

export const ensureTestUserExists = async () => {
  console.log('Creating test user');
  const { username, password } = TEST_USER;
  await UserDbModel.findOrCreate({
    where: { username },
    defaults: { username, passwordHash: hashString(password), createdWithVisitorId: '' },
  });
};

export const deleteTestUser = async () => {
  console.log('Deleting test user');
  await UserDbModel.destroy({ where: { username: TEST_USER.username } });
};

export const ensureTestUserNotLoggedInAnywhere = async () => {
  console.log('Deleting devices for test user');
  await DeviceDbModel.destroy({ where: { username: TEST_USER.username } });
};

export async function logInTestUser(page: Page) {
  const { username, password } = TEST_USER;
  await page.getByTestId(TEST_ID.switchToLoginButton).click();
  await fillLoginForm(page, username, password);
  await page.getByTestId(TEST_ID.loginButton).click();

  await page.waitForURL(`/account-sharing/home/${username}`);
  await assertAlert({
    page,
    severity: 'success',
    text: ACCOUNT_SHARING_COPY.loginSuccess(username),
  });
}

export async function fillLoginForm(page: Page, username: string, password: string) {
  await page.getByTestId(TEST_ID.usernameInput).fill(username);
  await page.getByTestId(TEST_ID.passwordInput).fill(password);
}
