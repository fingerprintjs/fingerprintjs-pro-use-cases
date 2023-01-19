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
    // replace with https://metrics.fingerprinthub.com/DBqbMN7zXxwl4Ei8/J5XlHIBN67YHskdR?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>
    // after switching subdomain to cloudfront distribution
    scriptUrlPattern:
      'https://d1ulg2zuhz9u95.cloudfront.net/DBqbMN7zXxwl4Ei8/J5XlHIBN67YHskdR?apiKey=<apiKey>&version=<version>&loaderVersion=<loaderVersion>',
    // replace with https://metrics.fingerprinthub.com/DBqbMN7zXxwl4Ei8/S7lqsWfAyw2lq4Za
    // after switching subdomain to cloudfront distribution
    endpoint: 'https://d1ulg2zuhz9u95.cloudfront.net/DBqbMN7zXxwl4Ei8/S7lqsWfAyw2lq4Za',
  });
  const fp = await fpPromise;
  setFingerprintToState(fp);
}
