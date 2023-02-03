import { FingerprintJsServerApiClient } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { resolveBackendRegion } from '../shared/region';

export const fingerprintJsApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY,
  region: resolveBackendRegion(),
});
