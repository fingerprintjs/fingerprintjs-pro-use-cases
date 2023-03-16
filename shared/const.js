// @ts-check
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const SITE_URL = IS_PRODUCTION ? 'https://fingerprinthub.com/' : 'http://localhost:3000/';

// Milliseconds helpers
export const MINUTE_MS = 60 * 1000;
export const FIVE_MINUTES_MS = 1000 * 60 * 5;
export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = 1000 * 60 * 60 * 24;
