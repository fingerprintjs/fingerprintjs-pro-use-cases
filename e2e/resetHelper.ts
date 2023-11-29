import { Page } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';

// Assumes you already are on a use case page with the Reset button present
export async function resetScenarios(page: Page) {
  await page.getByTestId(TEST_IDS.reset.resetButton).click();
  await page.waitForLoadState('networkidle');
  await page.getByTestId(TEST_IDS.reset.resetSuccess).waitFor({ timeout: 10000 });
}
