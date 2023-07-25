// @ts-check
import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import { useQuery } from 'react-query';
import { ENDPOINT, FRONTEND_REGION, PUBLIC_API_KEY, SCRIPT_URL_PATTERN } from '../server/const';

// This example demonstrates using the NPM package for the Fingerprint Pro agent.
// In the real world react-powered apps we recommend using our Fingerprint Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// Fingerprint Pro API key is available from the dashboard at: https://dashboard.fingerprint.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprint.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );

/** @type {import('@fingerprintjs/fingerprintjs-pro').LoadOptions} */
export const FP_LOAD_OPTIONS = {
  apiKey: PUBLIC_API_KEY,
  scriptUrlPattern: [SCRIPT_URL_PATTERN, FingerprintJS.defaultScriptUrlPattern],
  endpoint: ENDPOINT,
  // @ts-ignore
  region: FRONTEND_REGION,
};

async function getVisitorData({ extendedResult = true, linkedId }) {
  const fpPromise = FingerprintJS.load(FP_LOAD_OPTIONS);
  const fp = await fpPromise;

  return fp.get({
    extendedResult,
    linkedId,
    products: ['identification'],
  });
}

export const VISITOR_DATA_QUERY = 'VISITOR_DATA_QUERY';

/**
 * @typedef UseVisitorDataOptions
 * @property {boolean} [enabled=true]
 * @property {boolean} [extendedResult=true]
 * @property {string} [linkedId]
 */

/**
 * Query for fetching visitorData using our Fingerprint Pro agent.
 * @param {UseVisitorDataOptions} options
 * */
export function useVisitorData({ enabled = true, extendedResult = true, linkedId } = {}) {
  return useQuery(VISITOR_DATA_QUERY, () => getVisitorData({ extendedResult, linkedId }), {
    enabled,
  });
}
