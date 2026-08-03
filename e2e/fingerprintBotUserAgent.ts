/**
 * Identify our own E2E test traffic with a dedicated bot user agent, so it can be
 * recognized as first-party traffic instead of polluting third-party bot detection analytics.
 */
export const FINGERPRINT_BOT_USER_AGENT =
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; FingerprintBot/1.0; +https://fingerprint.com/fingerprint-bot';
