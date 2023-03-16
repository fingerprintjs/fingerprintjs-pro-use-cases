import { FingerprintJsServerApiClient } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { BACKEND_REGION, SERVER_API_KEY } from './const';

export const fingerprintJsApiClient = new FingerprintJsServerApiClient({
  apiKey: SERVER_API_KEY,
  region: BACKEND_REGION,
});
