import { Locator, Page, expect } from '@playwright/test';
import { TEST_ATTRIBUTES, TEST_IDS } from '../src/client/testIDs';
import { Severity } from '../src/server/checks';

/**
 *
 * When running E2E the tests against Production on demo.fingerprint.com, loading our analytics tools can slow down the tests
 * but primarily the Intercom bubble covers elements that the tests needs to click.
 * We load all of these through GTM so blocking the initial GTM request stops Intercom and other tools from interfering
 */
export async function blockGoogleTagManager(page: Page) {
  await page.route('**/*', (request) => {
    request.request().url().includes('googletagmanager.com') ? request.abort() : request.continue();
    return;
  });
}

// Assumes you already are on a use case page with the Reset button present
export async function resetScenarios(page: Page) {
  await page.waitForLoadState('networkidle');
  await page.getByTestId(TEST_IDS.reset.resetButton).click();
  await page.getByTestId(TEST_IDS.reset.resetSuccess).waitFor({ timeout: 20000 });
  await page.getByTestId(TEST_IDS.common.closeSnackbar).first().click();
}

type AssertAlertOrSnackbarArgs = {
  page: Page;
  severity: Severity | 'info';
  text: string;
  index?: number;
};

export async function assertAlert({ page, severity, text, index = 0 }: AssertAlertOrSnackbarArgs) {
  const alert = await page.getByTestId(TEST_IDS.common.alert).nth(index);
  await alert.waitFor({ timeout: 15000 });
  await expect(alert).toHaveAttribute(TEST_ATTRIBUTES.severity, severity);
  await expect(alert).toContainText(text);
}

export async function assertAlertNotPresent({ page, severity, text, index = 0 }: AssertAlertOrSnackbarArgs) {
  const alert = page
    .locator(`[${TEST_ATTRIBUTES.id}="${TEST_IDS.common.alert}"] [${TEST_ATTRIBUTES.severity}="${severity}"]`, {
      hasText: text,
    })
    .nth(index);
  await expect(alert).not.toBeVisible();
}

export async function assertSnackbar({ page, severity, text, index = 0 }: AssertAlertOrSnackbarArgs) {
  const snackbar = await page.getByTestId(TEST_IDS.common.snackBar).nth(index);
  await expect(snackbar).toHaveAttribute(TEST_ATTRIBUTES.severity, severity);
  await expect(snackbar).toContainText(text);
}

export const scrollToView = async (locator: Locator) => {
  await locator.evaluate((element) => element.scrollIntoView({ behavior: 'smooth', block: 'center' }));
};

export const scrollDemoIntoView = async (page: Page) => {
  const demoBrowser = await page.getByTestId(TEST_IDS.common.demoBrowser);
  await scrollToView(demoBrowser);
};
