import { Page, expect, test } from '@playwright/test';
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
    await page.getByText('Fingerprint Playground', { exact: true }).waitFor();
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
   * Fake a real browser instead: `initialPermission` until the user accepts, then `granted`, kept across reloads.
   * Reads answer with a fake position, Playwright WebKit times out on every fresh read after the first one.
   * `holdLocation`: reads wait until the test calls `window.e2eReleaseLocation()`, like a cold location fix
   * `timeoutReadNumbers`: which location reads (1-based, counted across reloads) time out
   * `readError`: every read fails
   *   - `denied`: the user denies the prompt
   *   - `unavailable`: the browser has permission, but the OS does not give it a location (e.g. macOS Location Services off)
   */
  const fakeLocation = async (
    page: Page,
    {
      initialPermission = 'prompt',
      holdLocation = false,
      timeoutReadNumbers = [],
      readError,
    }: {
      initialPermission?: PermissionState;
      holdLocation?: boolean;
      timeoutReadNumbers?: number[];
      readError?: 'denied' | 'unavailable';
    } = {},
  ) => {
    await page.addInitScript(
      ({ location, initialPermission, holdLocation, timeoutReadNumbers, readError }) => {
        let held: (() => void)[] | undefined = holdLocation ? [] : undefined;
        Object.assign(window, {
          e2eReleaseLocation: () => {
            held?.forEach((read) => read());
            held = undefined;
          },
        });
        const query = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = (descriptor) =>
          descriptor.name === 'geolocation'
            ? Promise.resolve({
                state: sessionStorage.getItem('e2eLocationPermission') ?? initialPermission,
                onchange: null,
              } as PermissionStatus)
            : query(descriptor);
        navigator.geolocation.getCurrentPosition = (onSuccess, onError) => {
          const readNumber = Number(sessionStorage.getItem('e2eLocationReads') ?? 0) + 1;
          sessionStorage.setItem('e2eLocationReads', String(readNumber));
          const error = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3, message: 'Fake error' };
          const fail = (code: number) => setTimeout(() => onError?.({ ...error, code } as GeolocationPositionError));
          if (readError) {
            if (readError === 'denied') sessionStorage.setItem('e2eLocationPermission', 'denied');
            fail(readError === 'denied' ? error.PERMISSION_DENIED : error.POSITION_UNAVAILABLE);
            return;
          }
          sessionStorage.setItem('e2eLocationPermission', 'granted');
          if (timeoutReadNumbers.includes(readNumber)) {
            fail(error.TIMEOUT);
            return;
          }
          const read = () =>
            setTimeout(() => onSuccess({ coords: location, timestamp: Date.now() } as GeolocationPosition));
          if (held) held.push(read);
          else read();
        };
      },
      { location: PRAGUE, initialPermission, holdLocation, timeoutReadNumbers, readError },
    );
  };

  const getLocationReads = (page: Page) => page.evaluate(() => Number(sessionStorage.getItem('e2eLocationReads') ?? 0));

  const expectProximityInMatchingEvents = async (page: Page) => {
    await expect(getWebProximityRow(page)).toContainText(/Zone .+ m radius/, { timeout: 15000 });
    const serverResponse = await getServerResponse(page);
    expect(serverResponse).toContain('precision_radius');
    expect(parseEventId(serverResponse)).toBe(parseEventId(await getAgentResponse(page)));
  };

  test('shows the proximity result after the user grants location permission', async ({ page }) => {
    await fakeLocation(page);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toBeVisible();
    // Nothing asks for location before the click
    expect(await getLocationReads(page)).toBe(0);
    // A reload would drop a temporary permission, and this marker with it
    await page.evaluate(() => Object.assign(window, { e2eSameDocument: true }));

    await page.getByTestId(TEST_ID.grantLocationButton).click();

    await expectProximityInMatchingEvents(page);
    await expect(getWebProximityRow(page)).toBeInViewport();
    expect(await page.evaluate(() => 'e2eSameDocument' in window)).toBe(true);
  });

  test('collects location automatically when it arrives after the first event', async ({ page }) => {
    await fakeLocation(page, { initialPermission: 'granted', holdLocation: true });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId(TEST_ID.serverResponseJSON)).toContainText('event_id');
    expect(await getServerResponse(page)).not.toContain('precision_radius');

    await page.evaluate(() => (window as unknown as { e2eReleaseLocation: () => void }).e2eReleaseLocation());

    await expectProximityInMatchingEvents(page);
  });

  test('collects location automatically when the agent on page load does not get one', async ({ page }) => {
    // Read 1: agent on page load (times out), read 2: ours, read 3: fresh agent
    await fakeLocation(page, { initialPermission: 'granted', timeoutReadNumbers: [1] });
    await page.reload({ waitUntil: 'networkidle' });

    await expectProximityInMatchingEvents(page);
  });

  test('offers to try again when the browser does not get a location', async ({ page }) => {
    await fakeLocation(page, { timeoutReadNumbers: [1] });
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByTestId(TEST_ID.grantLocationButton).click();

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText('Location not available: Fake error.');
    await proximityRow.getByRole('button', { name: 'Try again' }).click();

    await expectProximityInMatchingEvents(page);
  });

  test('offers to try again when the Server API request fails', async ({ page }) => {
    await fakeLocation(page);
    await page.reload({ waitUntil: 'networkidle' });
    await page.route('**/api/event/v4/**', (route) => route.abort('failed'));

    await page.getByTestId(TEST_ID.grantLocationButton).click();

    const proximityRow = getWebProximityRow(page);
    await assertAlert({ page, severity: 'error', text: 'Server API Request' });
    await expect(proximityRow).toContainText('Location not collected.');
    await page.unroute('**/api/event/v4/**');
    await proximityRow.getByRole('button', { name: 'Try again' }).click();

    await expectProximityInMatchingEvents(page);
  });

  test('tells the user how to allow location when it is already denied', async ({ page }) => {
    await fakeLocation(page, { initialPermission: 'denied' });
    await page.reload({ waitUntil: 'networkidle' });

    await expect(getWebProximityRow(page)).toContainText('Location denied. Allow it in browser settings and reload.');
    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toHaveCount(0);
  });

  test('tells the user how to allow location after they deny the prompt', async ({ page }) => {
    await fakeLocation(page, { readError: 'denied' });
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByTestId(TEST_ID.grantLocationButton).click();

    await expect(getWebProximityRow(page)).toContainText('Location denied. Allow it in browser settings and reload.');
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
