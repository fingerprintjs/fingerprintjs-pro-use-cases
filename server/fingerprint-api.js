import { FingerprintJsServerApiClient } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { resolveBackendRegion } from '../shared/region';

export const fingerprintJsApiClient = new FingerprintJsServerApiClient({
  // In a real world use-case, we recommend using Auth-API-Key header instead: https://dev.fingerprint.com/docs/server-api#api-methods.
  // The API key should be stored in the environment variables/secrets.
  apiKey: process.env.PRIVATE_API_KEY ?? 'F6gQ8H8vQLc7mVsVKaFx',
  region: resolveBackendRegion(),
});
