import FingerprintJS from '@fingerprintjs/fingerprintjs-pro';

// This example demonstrates using the NPM package for the FingerprintJS Pro agent.
// In the real world react-powerred apps we recommend using our FingerprintJS Pro React/NextJS library instead: https://github.com/fingerprintjs/fingerprintjs-pro-react
// FingerprintJS Pro API key is availablee from the dashboard at: https://dashboard.fingerprintjs.com/login
// Alternatively, one can also use the CDN approach instead of NPM: https://dev.fingerprintjs.com/docs#js-agent
// const fpPromise = import('https://fpcdn.io/v3/rzpSduhT63F6jaS35HFo').then(
//   (FingerprintJS) => FingerprintJS.load()
// );
export async function getFingerprintJS(setFingerprintToState) {
    const fpPromise = FingerprintJS.load({ token: 'rzpSduhT63F6jaS35HFo', endpoint: 'https://metrics.fingerprinthub.com' });
    const fp = await fpPromise;
    setFingerprintToState(fp);
}
