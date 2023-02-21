import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';
import { useQuery } from 'react-query';
import { resolveFrontendRegion } from '../shared/region';

// This example demonstrates using the NPM package for the Fingerprint Pro agent.
// In the real world react-powered apps we recommend using our Fingerprint Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// Fingerprint Pro API key is available from the dashboard at: https://dashboard.fingerprint.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprint.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );
async function getVisitorData({ extendedResult = true, linkedId }) {
  const fpPromise = FingerprintJS.load({
    apiKey: process.env.NEXT_PUBLIC_API_KEY ?? 'rzpSduhT63F6jaS35HFo',
    scriptUrlPattern: [
      'https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/J5XlHIBN67YHskdR?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
      FingerprintJS.defaultScriptUrlPattern,
    ],
    endpoint: `https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/S7lqsWfAyw2lq4Za?region=${resolveFrontendRegion()}`,
    region: resolveFrontendRegion(),
  });
  const fp = await fpPromise;

  return fp.get({
    extendedResult,
    linkedId,
  });
}

export const VISITOR_DATA_QUERY = 'VISITOR_DATA_QUERY';

/**
 * Query for fetching visitorData using our Fingerprint Pro agent.
 * */
export function useVisitorData({ enabled = true, extendedResult = true, linkedId } = {}) {
  return useQuery(VISITOR_DATA_QUERY, () => getVisitorData({ extendedResult, linkedId }), {
    enabled,
  });
}
