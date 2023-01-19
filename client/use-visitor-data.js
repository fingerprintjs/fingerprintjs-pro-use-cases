import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import { useQuery } from 'react-query';

// This example demonstrates using the NPM package for the Fingerprint Pro agent.
// In the real world react-powered apps we recommend using our Fingerprint Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// Fingerprint Pro API key is available from the dashboard at: https://dashboard.fingerprint.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprint.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );
async function getVisitorData({ extendedResult = true }) {
  const fpPromise = FingerprintJS.load({
    token: 'rzpSduhT63F6jaS35HFo',
    scriptUrlPattern:
      'https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/J5XlHIBN67YHskdR?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
    endpoint: 'https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/S7lqsWfAyw2lq4Za',
  });
  const fp = await fpPromise;

  return fp.get({
    extendedResult,
  });
}

export const VISITOR_DATA_QUERY = 'VISITOR_DATA_QUERY';

/**
 * Query for fetching visitorData using our Fingerprint Pro agent.
 * */
export function useVisitorData({ enabled = true, extendedResult = true } = {}) {
  return useQuery(VISITOR_DATA_QUERY, () => getVisitorData({ extendedResult }), {
    enabled,
  });
}
