import { FingerprintJsServerApiClient } from '@fingerprintjs/fingerprintjs-pro-server-api';
import { resolveBackendRegion } from '../shared/region';
import {SERVER_API_KEY} from './const';

export const fingerprintJsApiClient = new FingerprintJsServerApiClient({
  apiKey: process.env.PRIVATE_API_KEY ?? SERVER_API_KEY,
  region: resolveBackendRegion(),
});
