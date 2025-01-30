/**
 * Env variables shared between Next.js and Playwright
 * Playwright cannot import ESM-only packages like `t3-env`.
 * We have to access environment variables for Playwright tests manually 😔.
 * https://github.com/microsoft/playwright/issues/23662
 */
export const TEST_BUILD = Boolean(process.env.TEST_BUILD);
export const IS_PRODUCTION = Boolean(process.env.NODE_ENV === 'production');
export const IS_DEVELOPMENT = Boolean(process.env.NODE_ENV === 'development');
export const HASH_SALT = process.env.HASH_SALT || 'defaultSalt';
// Use these to run e2e tests against production/staging deployment
export const PRODUCTION_E2E_TEST_BASE_URL = process.env.PRODUCTION_E2E_TEST_BASE_URL;
export const E2E_TEST_TOKEN = process.env.E2E_TEST_TOKEN || 'e2e-test-token';
