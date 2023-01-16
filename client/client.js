import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

// This example demonstrates using the NPM package for the Fingerprint Pro agent.
// In the real world react-powered apps we recommend using our Fingerprint Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// Fingerprint Pro API key is available from the dashboard at: https://dashboard.fingerprint.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprint.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );
export async function getFingerprintJS(setFingerprintToState) {
  const fpPromise = FingerprintJS.load({
    token: 'rzpSduhT63F6jaS35HFo',
    endpoint: 'https://metrics.fingerprinthub.com',
  });
  const fp = await fpPromise;
  setFingerprintToState(fp);
}
