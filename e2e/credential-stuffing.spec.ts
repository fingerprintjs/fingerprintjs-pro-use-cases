import { Page, test } from '@playwright/test';
import { blockGoogleTagManager, resetScenarios } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';
import { CREDENTIAL_STUFFING_COPY } from '../src/app/credential-stuffing/api/authenticate/copy';

// Wait for the API response, not just the message.
// The message from the previous attempt stays on screen, so waiting for its text alone can pass too early.
const submitForm = async (page: Page) => {
  const response = page.waitForResponse('**/credential-stuffing/api/authenticate');
  // Waits for the button to be clickable out of the box
  await page.getByTestId(TEST_IDS.credentialStuffing.login).click();
  await response;
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/credential-stuffing');
  await resetScenarios(page);
});

test.describe('Credential stuffing', () => {
  test('should prevent login even with correct credentials', async ({ page }) => {
    await submitForm(page);
    await page.getByText(CREDENTIAL_STUFFING_COPY.differentVisitorIdUseMFA).waitFor();
  });

  test('should lock user after 5 invalid login attempts', async ({ page }) => {
    await page.getByTestId(TEST_IDS.credentialStuffing.password).fill('wrong-password');

    // 5 attempts with incorrect password tried and rejected
    for (let i = 0; i < 5; i++) {
      await submitForm(page);
      await page.getByText(CREDENTIAL_STUFFING_COPY.invalidCredentials).waitFor();
    }

    // 6th attempt with incorrect password not performed at all
    await submitForm(page);
    await page.getByText(CREDENTIAL_STUFFING_COPY.tooManyAttempts).waitFor();
  });
});
