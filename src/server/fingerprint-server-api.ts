import { FingerprintServerApiClient, Region } from '@fingerprint/node-sdk';
import { clientEnv } from '../env/client';
import { serverEnv } from '../env/server';

const backendRegionMap = {
  eu: Region.EU,
  ap: Region.AP,
  us: Region.Global,
};

export const getServerRegion = (region: 'eu' | 'ap' | 'us') => backendRegionMap[region];

export const fingerprintServerApiClient = new FingerprintServerApiClient({
  apiKey: serverEnv.SERVER_API_KEY,
  region: getServerRegion(clientEnv.NEXT_PUBLIC_REGION),
});
