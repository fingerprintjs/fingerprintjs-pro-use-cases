import { defineConfig, devices } from '@playwright/test';
/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import 'dotenv/config';

const IS_CI = Boolean(process.env.CI);
const PORT = process.env.PORT || 3000;
export const PRODUCTION_E2E_TEST_BASE_URL = process.env.PRODUCTION_E2E_TEST_BASE_URL;
const LOCALHOST_URL = `http://localhost:${PORT}`;
/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: IS_CI,
  /* Retry on CI only */
  retries: IS_CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html'], IS_CI ? ['github'] : ['list']],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: PRODUCTION_E2E_TEST_BASE_URL ?? LOCALHOST_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* In CI/GitHub action, run the production server before running tests
   * (assumes `pnpm build` was called before)
   */
  webServer: PRODUCTION_E2E_TEST_BASE_URL
    ? undefined
    : {
        command: `pnpm start`,
        url: LOCALHOST_URL,
        timeout: 120 * 1000,
        // Don't `pnpm start` (reuse existing server instead) if you are running locally
        reuseExistingServer: !IS_CI,
      },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], screenshot: { mode: 'only-on-failure' } },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], screenshot: { mode: 'only-on-failure' } },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], screenshot: { mode: 'only-on-failure' } },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { channel: 'chrome' },
    // },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */
  // outputDir: 'test-results/',
});
