/**
 * Comprehensive server check for t3-env.
 * https://github.com/t3-oss/t3-env/issues/154
 */
export const isServer = Boolean(
  typeof window === 'undefined' ||
    'Deno' in window ||
    process.env['NODE_ENV'] === 'test' ||
    process.env['JEST_WORKER_ID'] ||
    process.env['VITEST_WORKER_ID'],
);
