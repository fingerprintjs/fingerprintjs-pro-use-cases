// Milliseconds helpers
export const MINUTE_MS = 60 * 1000;
export const FIVE_MINUTES_MS = 1000 * 60 * 5;
export const HOUR_MS = 1000 * 60 * 60;
export const DAY_MS = 1000 * 60 * 60 * 24;

// Waiting helpers
export const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
