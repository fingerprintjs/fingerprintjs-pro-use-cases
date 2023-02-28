export const IPv4_REGEX = /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/;
export const ALLOWED_REQUEST_TIMESTAMP_DIFF_MS = 3000;
// Confidence score thresholds might be different for different scenarios
export const MIN_CONFIDENCE_SCORE = 0.85;

// Warning: In the real world The Server API key should be secretly stored in the environment variables/secrets.
// We are keeping it here just to make it easy to run the demo.
export const SERVER_API_KEY = 'F6gQ8H8vQLc7mVsVKaFx';
export const PUBLIC_API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? 'rzpSduhT63F6jaS35HFo';
