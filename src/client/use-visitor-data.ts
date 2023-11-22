import FingerprintJS, { LoadOptions } from '@fingerprintjs/fingerprintjs-pro';
import { useQuery } from 'react-query';
import { CUSTOM_TLS_ENDPOINT, ENDPOINT, FRONTEND_REGION, PUBLIC_API_KEY, SCRIPT_URL_PATTERN } from '../server/const';

export const FP_LOAD_OPTIONS: LoadOptions = {
  apiKey: PUBLIC_API_KEY,
  scriptUrlPattern: [SCRIPT_URL_PATTERN, FingerprintJS.defaultScriptUrlPattern],
  endpoint: [ENDPOINT, FingerprintJS.defaultEndpoint],
  region: FRONTEND_REGION,
  tlsEndpoint: CUSTOM_TLS_ENDPOINT ? [CUSTOM_TLS_ENDPOINT, FingerprintJS.defaultTlsEndpoint] : undefined,
};

// This example demonstrates using the NPM package for the Fingerprint Pro agent.
// In the real world react-powered apps we recommend using our Fingerprint Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// Fingerprint Pro API key is available from the dashboard at: https://dashboard.fingerprint.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprint.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );

type GetVisitorDataArgs = {
  extendedResult?: boolean;
  linkedId?: string;
};

async function getVisitorData({ extendedResult = true, linkedId }: GetVisitorDataArgs) {
  const fpPromise = FingerprintJS.load(FP_LOAD_OPTIONS);
  const fp = await fpPromise;

  return fp.get({
    extendedResult,
    linkedId,
    products: ['identification'],
  });
}

export const VISITOR_DATA_QUERY = 'VISITOR_DATA_QUERY';

type UseVisitorDataOptions = {
  enabled?: boolean;
  extendedResult?: boolean;
  linkedId?: string;
};

/**
 * Query for fetching visitorData using our Fingerprint Pro agent.
 * */
export function useVisitorData({ enabled = true, extendedResult = true, linkedId }: UseVisitorDataOptions = {}) {
  return useQuery(VISITOR_DATA_QUERY, () => getVisitorData({ extendedResult, linkedId }), {
    enabled,
  });
}
