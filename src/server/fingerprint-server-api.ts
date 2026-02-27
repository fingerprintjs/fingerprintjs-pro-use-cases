import { FingerprintServerApiClient, Region } from '@fingerprint/node-sdk';
import { env } from '../env';

const backendRegionMap = {
  eu: Region.EU,
  ap: Region.AP,
  us: Region.Global,
};

export const getServerRegion = (region: 'eu' | 'ap' | 'us') => backendRegionMap[region];

export const fingerprintServerApiClient = new FingerprintServerApiClient({
  apiKey: env.SERVER_API_KEY,
  region: getServerRegion(env.NEXT_PUBLIC_REGION),
});
