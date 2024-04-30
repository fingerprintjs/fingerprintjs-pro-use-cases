import { test, expect, Page } from '@playwright/test';
import { TEST_IDS } from '../src/client/testIDs';
import { VPN_DETECTION_COPY } from '../src/app/vpn-detection/copy';
import { assertAlert } from './e2eTestUtils';

const getActivateButton = (page: Page) => page.getByTestId(TEST_IDS.vpnDetection.activateRegionalPricing);

test.describe('VPN Detection demo', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/vpn-detection');
  });

  test('should personalize UI copy based on user location', async ({ page }) => {
    await expect(page.getByTestId(TEST_IDS.vpnDetection.callout)).toContainText(VPN_DETECTION_COPY.personalizedCallout);

    const button = await page.getByTestId(TEST_IDS.vpnDetection.activateRegionalPricing);
    await expect(button).toContainText(/\d+% off with/);
  });

  test('should allow to activate regional pricing without VPN', async ({ page }) => {
    await getActivateButton(page).click();
    await assertAlert({
      page,
      severity: 'success',
      text: VPN_DETECTION_COPY.success({ discount: 20, country: 'Test Country' }).substring(0, 20),
    });

    const discountLineItem = await page.getByTestId(TEST_IDS.common.cart.discount);
    await expect(discountLineItem).toContainText(VPN_DETECTION_COPY.discountName);
  });

  test('should not allow to activate regional pricing with VPN', async ({ page }) => {
    // Mock positive VPN detection result
    const vpnError = 'You are using a VPN.';
    await page.route('/vpn-detection/api/activate-ppp', (route) =>
      route.fulfill({ status: 403, body: JSON.stringify({ severity: 'error', message: vpnError }) }),
    );

    await getActivateButton(page).click();
    await assertAlert({ page, severity: 'error', text: vpnError });
    await expect(page.getByTestId(TEST_IDS.common.cart.discount)).toBeAttached({ attached: false });
  });
});
