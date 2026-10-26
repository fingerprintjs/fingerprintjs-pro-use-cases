// Playground UI and live identification contracts. https://docs.fingerprint.com/docs/smart-signals-reference
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
  // Positive accuracy is required for proximity. https://docs.fingerprint.com/docs/smart-signals-reference#proximity-detection
  const PRAGUE = { latitude: 50.0755, longitude: 14.4378, accuracy: 20 };

  // Model temporary access for one request or one document.
  // https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites
  // Native permission is pregranted; only the browser permission APIs are simulated below.
  const fakeLocation = async (
    page: Page,
    context: BrowserContext,
    {
      initialPermission = 'prompt',
      slowReadNumbers = [],
      readError,
      failReadNumbers,
      permissionLifetime = 'document',
    }: {
      initialPermission?: PermissionState;
      slowReadNumbers?: number[];
      readError?: 'denied' | 'unavailable' | 'timeout';
      failReadNumbers?: number[];
      permissionLifetime?: 'document' | 'request';
    } = {},
  ) => {
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation(PRAGUE);
    await page.addInitScript(
      ({ initialPermission, slowReadNumbers, readError, failReadNumbers, permissionLifetime }) => {
        class LocationPermissionStatus extends EventTarget implements PermissionStatus {
          readonly name = 'geolocation';
          state = initialPermission;
          onchange: PermissionStatus['onchange'] = null;

          update(state: PermissionState) {
            this.state = state;
            const event = new Event('change');
            this.dispatchEvent(event);
            this.onchange?.call(this, event);
          }
        }
        const permission = new LocationPermissionStatus();
        const query = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = (descriptor) =>
          descriptor.name === 'geolocation' ? Promise.resolve(permission) : query(descriptor);
        const getCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
        const readLocation = (onSuccess: PositionCallback, onError: PositionErrorCallback | null | undefined) => {
          const readNumber = Number(sessionStorage.getItem('e2eLocationReads') ?? 0) + 1;
          sessionStorage.setItem('e2eLocationReads', String(readNumber));
          const failed = readError && (!failReadNumbers || failReadNumbers.includes(readNumber));
          return {
            onSuccess: (position: GeolocationPosition) => {
              permission.update('granted');
              setTimeout(
                () => {
                  onSuccess(position);
                  sessionStorage.setItem(
                    'e2eLocationCompletions',
                    String(Number(sessionStorage.getItem('e2eLocationCompletions') ?? 0) + 1),
                  );
                  if (permissionLifetime === 'request' && permission.state === 'granted')
                    permission.update(initialPermission);
                },
                slowReadNumbers.includes(readNumber) ? 1500 : 0,
              );
            },
            fail: () => {
              if (readError === 'denied') permission.update('denied');
              onError?.({
                code: readError === 'denied' ? 1 : readError === 'timeout' ? 3 : 2,
                message: 'Fake error',
                PERMISSION_DENIED: 1,
                POSITION_UNAVAILABLE: 2,
                TIMEOUT: 3,
              });
            },
            failed,
          };
        };
        navigator.geolocation.getCurrentPosition = (onSuccess, onError, options) => {
          const read = readLocation(onSuccess, onError);
          if (read.failed) setTimeout(() => read.fail());
          else getCurrentPosition(read.onSuccess, onError, options);
        };
      },
      { initialPermission, slowReadNumbers, readError, failReadNumbers, permissionLifetime },
    );
  };

  const getLocationReads = (page: Page) => page.evaluate(() => Number(sessionStorage.getItem('e2eLocationReads') ?? 0));

  test('shows proximity after document permission without navigating', async ({ page, context }) => {
    await fakeLocation(page, context);
    await page.reload({ waitUntil: 'networkidle' });

    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toBeVisible();
    expect(await getLocationReads(page)).toBe(0);
    const navigations: string[] = [];
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) navigations.push(frame.url());
    });
    await page.getByTestId(TEST_ID.grantLocationButton).click();

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
    await expect(proximityRow).toBeInViewport();
    expect(await getServerResponse(page)).toContain('precision_radius');
    expect(navigations).toEqual([]);
    const eventId = parseEventId(await getAgentResponse(page));
    expect(eventId).toMatch(/^\d{13}\.[a-zA-Z0-9]{6}$/);
    expect(parseEventId(await getServerResponse(page))).toEqual(eventId);
  });

  test('offers retry when permission expires before agent collection', async ({ page, context }) => {
    await fakeLocation(page, context, { permissionLifetime: 'request' });
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId(TEST_ID.grantLocationButton).click();

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText('Location not collected', { timeout: 15000 });
    await expect(proximityRow.getByRole('button', { name: 'Try again' })).toBeVisible();
    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toHaveCount(0);
    expect(await getServerResponse(page)).not.toContain('precision_radius');
  });

  test('uses the completed location read when retrying identification', async ({ page, context }) => {
    // Delay the fresh agent's location read beyond its identification request.
    await fakeLocation(page, context, { slowReadNumbers: [2] });
    await page.reload({ waitUntil: 'networkidle' });

    await page.getByTestId(TEST_ID.grantLocationButton).click();

    const proximityRow = getWebProximityRow(page);
    await expect(proximityRow).toContainText('Location not collected', { timeout: 15000 });
    await expect.poll(() => page.evaluate(() => Number(sessionStorage.getItem('e2eLocationCompletions') ?? 0))).toBe(2);
    const readsBeforeRetry = await getLocationReads(page);
    const previousEventId = parseEventId(await getAgentResponse(page));
    await proximityRow.getByRole('button', { name: 'Try again' }).click();

    await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
    expect(await getLocationReads(page)).toBe(readsBeforeRetry);
    const eventId = parseEventId(await getAgentResponse(page));
    expect(eventId).toMatch(/^\d{13}\.[a-zA-Z0-9]{6}$/);
    expect(parseEventId(await getServerResponse(page))).toEqual(eventId);
    expect(eventId).not.toEqual(previousEventId);
  });

  for (const readError of ['unavailable', 'timeout'] as const) {
    test(`can retry after location is ${readError}`, async ({ page, context }) => {
      await fakeLocation(page, context, { readError, failReadNumbers: [1] });
      await page.reload({ waitUntil: 'networkidle' });

      await page.getByTestId(TEST_ID.grantLocationButton).click();
      const proximityRow = getWebProximityRow(page);
      await expect(proximityRow).toContainText('Location not available: Fake error');
      await proximityRow.getByRole('button', { name: 'Try again' }).click();

      await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
      expect(await getServerResponse(page)).toContain('precision_radius');
      const eventId = parseEventId(await getAgentResponse(page));
      expect(eventId).toMatch(/^\d{13}\.[a-zA-Z0-9]{6}$/);
      expect(parseEventId(await getServerResponse(page))).toEqual(eventId);
    });
  }

  for (const readError of ['unavailable', 'timeout'] as const) {
    test(`can restart location after the agent read is ${readError}`, async ({ page, context }) => {
      await fakeLocation(page, context, { readError, failReadNumbers: [2] });
      await page.reload({ waitUntil: 'networkidle' });
      await page.getByTestId(TEST_ID.grantLocationButton).click();

      const proximityRow = getWebProximityRow(page);
      await expect(proximityRow).toContainText('Location not collected', { timeout: 15000 });
      await proximityRow.getByRole('button', { name: 'Request location again' }).click();

      await expect(proximityRow).toContainText(/Zone .+ m radius/, { timeout: 15000 });
      const eventId = parseEventId(await getAgentResponse(page));
      expect(eventId).toMatch(/^\d{13}\.[a-zA-Z0-9]{6}$/);
      expect(parseEventId(await getServerResponse(page))).toEqual(eventId);
    });
  }

  test('tells the user how to allow location when it is already denied', async ({ page, context }) => {
    await fakeLocation(page, context, { initialPermission: 'denied' });
    await page.reload({ waitUntil: 'networkidle' });

    await expect(getWebProximityRow(page)).toContainText('Location denied. Allow it in browser settings and reload.');
    await expect(page.getByTestId(TEST_ID.grantLocationButton)).toHaveCount(0);
  });

  test('tells the user how to allow location after they deny the prompt', async ({ page, context }) => {
    await fakeLocation(page, context, { readError: 'denied' });
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
