import { LoadOptions } from '@fingerprintjs/fingerprintjs-pro';
import { Region } from '@fingerprintjs/fingerprintjs-pro-server-api';

export const IPv4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/;
export const ALLOWED_REQUEST_TIMESTAMP_DIFF_MS = 3000;

// Confidence score thresholds might be different for different scenarios
export const MIN_CONFIDENCE_SCORE = process.env.MIN_CONFIDENCE_SCORE ? Number(process.env.MIN_CONFIDENCE_SCORE) : 0.85;

const BackendRegionMap = {
  eu: Region.EU,
  ap: Region.AP,
  us: Region.Global,
};

type AgentRegion = LoadOptions['region'];

// Warning: In the real world The Server API key should be secretly stored in the environment variables/secrets.
// We are keeping it here just to make it easy to run the demo.
export const SERVER_API_KEY = process.env.PRIVATE_API_KEY;
export const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY;
export const LOCAL_ENDPOINTS = "https://5387-3-144-123-246.ngrok-free.app"

export const FRONTEND_REGION: AgentRegion = (process.env.NEXT_PUBLIC_FRONTEND_REGION as AgentRegion) ?? 'us';
export const BACKEND_REGION: Region = BackendRegionMap[process.env.BACKEND_REGION] ?? Region.Global;
export const SCRIPT_URL_PATTERN =
  process.env.NEXT_PUBLIC_SCRIPT_URL_PATTERN ??
  'https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/J5XlHIBN67YHskdR?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>';
export const ENDPOINT =
  process.env.NEXT_PUBLIC_ENDPOINT ??
  `https://fpcf.fingerprinthub.com/DBqbMN7zXxwl4Ei8/S7lqsWfAyw2lq4Za?region=${FRONTEND_REGION}`;
export const CUSTOM_TLS_ENDPOINT = process.env.NEXT_PUBLIC_CUSTOM_TLS_ENDPOINT;
