import { BrowserContext, Page, expect, test } from '@playwright/test';
import { assertAlert, blockGoogleTagManager, scrollToView } from './e2eTestUtils';
import { TEST_IDS } from '../src/client/testIDs';

const TEST_ID = TEST_IDS.playground;

const getAgentResponse = async (page: Page) => {
  const agentResponse = await page.getByTestId(TEST_ID.agentResponseJSON);
  const agentResponseText = await agentResponse.textContent();
  return agentResponseText ?? 'Agent response not found';
};

const getServerResponse = async (page: Page) => {
  const serverResponse = await page.getByTestId(TEST_ID.serverResponseJSON);
  const serverResponseText = await serverResponse.textContent();
  return serverResponseText ?? 'Server response not found';
};

function parseEventId(inputString: string) {
  const regex = /(?:event_id|requestId):\s*"([^"]+)"/;
  const match = inputString.match(regex);

  if (match && match[1]) {
    return match[1];
  }
  return null;
}

const clickPlaygroundRefreshButton = async (page: Page) => {
  await page.getByTestId(TEST_ID.refreshButton).first().click();
  // Artificial wait necessary to make sure you get the updated response every time
  await page.waitForTimeout(3000);
};

test.beforeEach(async ({ page }) => {
  await blockGoogleTagManager(page);
  await page.goto('/playground', { waitUntil: 'networkidle' });
});

test.describe('Playground page', () => {
  test('Page renders basic skeleton elements', async ({ page }) => {
    await page.getByText('Fingerprint Pro Playground', { exact: true }).waitFor();
    await page.getByText('Your Visitor ID is').waitFor();
    await page.getByTestId(TEST_ID.refreshButton).first().waitFor();

    await page.getByText('Identification', { exact: true }).waitFor();
    await page.getByText('Smart signals', { exact: true }).waitFor();
    await page.getByText('Mobile Smart signals', { exact: true }).waitFor();

    await page.getByText('JavaScript Agent Response', { exact: true }).waitFor();
    await page.getByText('Server API Response', { exact: true }).waitFor();
  });

  test('Page renders signal tables', async ({ page }) => {
    await page.getByText('Last Seen', { exact: true }).waitFor();
    await page.getByText('Confidence Score', { exact: true }).waitFor();

    await page.getByText('Geolocation', { exact: true }).waitFor();
    await page.getByText('VPN', { exact: true }).waitFor();

    await page.getByText('IP Blocklist', { exact: true }).waitFor();
    await page.getByText('Proxy Detection', { exact: true }).waitFor();
    await page.getByText('Rare Device', { exact: true }).waitFor();
    await page.getByText('Emulator', { exact: true }).waitFor();
    await page.getByText('iOS Simulator', { exact: true }).waitFor();
    await page.getByText('Proximity Detection', { exact: true }).waitFor();
    await page.getByText('Proximity Detection (Mobile)', { exact: true }).waitFor();
    await page.getByText('Tampered Request', { exact: true }).waitFor();
    await page.getByText('Active Call Detection', { exact: true }).waitFor();
    await page.getByText('Developer Tools (Mobile)', { exact: true }).waitFor();
    await page.getByText('VPN (Mobile)', { exact: true }).waitFor();
  });

  test('Page renders agent response', async ({ page }) => {
    const agentResponse = await getAgentResponse(page);
    expect(agentResponse).toContain('event_id');
    expect(agentResponse).toContain('visitor_id');
  });

  test('Page renders server response', async ({ page }) => {
    const serverResponse = await getServerResponse(page);

    expect(serverResponse).toContain('event_id');
    expect(serverResponse).toContain('visitor_id');
    expect(serverResponse).toContain('incognito');
    expect(serverResponse).toContain('bot');
    expect(serverResponse).toContain('vpn');
    expect(serverResponse).toContain('privacy_settings');
  });

  test('Reload button updates agent response', async ({ page }) => {
    const oldEventId = parseEventId(await getAgentResponse(page));
    await clickPlaygroundRefreshButton(page);
    const eventId = parseEventId(await getAgentResponse(page));

    expect(oldEventId).not.toBeNull();
    expect(eventId).not.toBeNull();
    expect(oldEventId).toHaveLength(20);
    expect(eventId).toHaveLength(20);
    expect(eventId).not.toEqual(oldEventId);
  });

  test('Reload button updates server response', async ({ page }) => {
    const oldEventId = parseEventId(await getServerResponse(page));
    await clickPlaygroundRefreshButton(page);
    const eventId = parseEventId(await getServerResponse(page));

    expect(oldEventId).not.toBeNull();
    expect(eventId).not.toBeNull();
    expect(oldEventId).toHaveLength(20);
    expect(eventId).toHaveLength(20);
    expect(eventId).not.toEqual(oldEventId);
  });

  test('Clicking JSON link scrolls to appropriate JSON property', async ({ page }) => {
    const seeJsonLink = await page.getByText('See the JSON below');
    await scrollToView(seeJsonLink);
    await seeJsonLink.click();
    await expect(page.locator('span.json-view--property:text("raw_device_attributes")')).toBeInViewport();
  });

  test('shows error alert while keeping results when server API fails on refresh', async ({ page }) => {
    await page.getByText('Your Visitor ID is').waitFor();

    await page.route('**/api/event/v4/**', (route) => route.abort('failed'));

    await clickPlaygroundRefreshButton(page);

    await assertAlert({ page, severity: 'error', text: 'Server API Request' });
    await expect(page.getByText('Your Visitor ID is')).toBeVisible();
  });
});

test.describe('Proximity detection', () => {
  const getWebProximityRow = (page: Page) =>
    page.getByRole('row').filter({ has: page.getByRole('link', { name: 'Proximity Detection', exact: true }) });
  // Playwright defaults `accuracy` to 0, which gives no `proximity` in the event, real devices always report > 0
  const PRAGUE = { latitude: 50.0755, longitude: 14.4378, accuracy: 20 };

  /**
   * Headless Chromium reports `denied` for ungranted permissions.
   * Fake a real browser instead: `prompt` until the user accepts, then `granted`, kept across reloads.
   * `slowReadNumbers`: which location reads (1-based, counted across reloads) answer after 1.5 s, like a cold fix
   */
  const fakeFirstVisitLocation = (page: Page, slowReadNumbers: number[] = []) =>
    page.addInitScript((slowReads) => {
      const query = navigator.permissions.query.bind(navigator.permissions);
      navigator.permissions.query = (descriptor) =>
        descriptor.name === 'geolocation'
          ? Promise.resolve({
              state: sessionStorage.getItem('e2eLocationGranted') ? 'granted' : 'prompt',
              onchange: null,
            } as PermissionStatus)
          : query(descriptor);
      const getCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = (onSuccess, ...rest) => {
        const readNumber = Number(sessionStorage.getItem('e2eLocationReads') ?? 0) + 1;
        sessionStorage.setItem('e2eLocationReads', String(readNumber));
        getCurrentPosition((position) => {
          sessionStorage.setItem('e2eLocationGranted', 'true');
          setTimeout(() => onSuccess(position), slowReads.includes(readNumber) ? 1500 : 0);
        }, ...rest);
      };
    }, slowReadNumbers);

  const getLocationReads = (page: Page) =>
    page.evaluate(() => Number(sessionStorage.getItem('e2eLocationReads') ?? 0));

  const grantLocation = async (page: Page, context: BrowserContext) => {
    // Stands in for the user accepting the browser prompt
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(PRAGUE);
    await page.getByTestId(TEST_ID.grantLocationButton).click();
  };

  test('shows the proximity result after the user grants location permission', async ({ page, context }) => {
    await fakeFirstVisitLocation(page);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toBeVisible();
    // Nothing asks for location before the click
    expect(await getLocationReads(page)).toBe(0);

    await grantLocation(page, context);

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
    await expect(proximityRow).toBeInViewport();
    expect(await getServerResponse(page)).toContain('precision_radius');
  });

  test('offers to try again when location is too slow for the agent', async ({ page, context }) => {
    // Read 1: our button, read 2: agent after the reload (too slow), read 3: agent after "Try again"
    await fakeFirstVisitLocation(page, [2]);
    await page.reload({ waitUntil: 'networkidle' });

    await grantLocation(page, context);

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText('Location was too slow', { timeout: 15000 });
    await proximityRow.getByRole('button', { name: 'Try again' }).click();

    await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
    expect(await getLocationReads(page)).toBe(3);
  });

  test.describe('with location permission granted', () => {
    test.use({ permissions: ['geolocation'], geolocation: PRAGUE });

    test('shows the proximity result without the button', async ({ page }) => {
      const proximityRow = getWebProximityRow(page);
      await expect(proximityRow).toContainText(/Zone .+ m radius/);
      await expect(page.getByTestId(TEST_ID.grantLocationButton)).toHaveCount(0);
    });
  });
});

test.describe('Proxy integration', () => {
  const proxyIntegrations = [
    'https://metrics.fingerprinthub.com',
    'https://demo.fingerprint.com/DBqbMN7zXxwl4Ei8',
    process.env.NEXT_PUBLIC_ENDPOINT ?? 'NO_CUSTOM_PROXY_IN_ENV',
  ];

  /**
   * If any JS agent network request fails, fail the test.
   * This captures proxy integration failures that would otherwise go unnoticed thanks to default endpoint fallbacks.
   */
  test('Proxy integration works on Playground, no network errors', async ({ page }) => {
    page.on('requestfailed', (request) => {
      const url = request.url();
      const failure = request.failure()?.errorText;

      proxyIntegrations.forEach((proxy) => {
        if (url.includes(proxy)) {
          // This fails the test and prints the relevant info in test result
          expect(url + ' ' + failure).toBeUndefined();
        }
      });
    });

    await clickPlaygroundRefreshButton(page);
  });
});
