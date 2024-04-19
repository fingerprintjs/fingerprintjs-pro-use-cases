import '../styles/global-styles.scss';
import Head from 'next/head';
import { FpjsProvider, FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';
import { AppProps } from 'next/app';
import DeploymentUtils from '../client/DeploymentUtils';
import Providers from '../Providers';
import { Layout } from '../Layout';
import { env } from '../env';

const FP_LOAD_OPTIONS: FingerprintJSPro.LoadOptions = {
  apiKey: env.NEXT_PUBLIC_API_KEY,
  scriptUrlPattern: [env.NEXT_PUBLIC_SCRIPT_URL_PATTERN, FingerprintJSPro.defaultScriptUrlPattern],
  endpoint: [env.NEXT_PUBLIC_ENDPOINT, FingerprintJSPro.defaultEndpoint],
  region: env.NEXT_PUBLIC_REGION,
};

export type CustomPageProps = { embed?: boolean };

function CustomApp({ Component, pageProps }: AppProps<CustomPageProps>) {
  return (
    <Providers>
      <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
        <Head>
          <meta name='viewport' content='width=device-width, initial-scale=1.0' />
          <link rel='icon' type='image/x-icon' href='/favicon.ico' />
          <title>Fingerprint Pro Use Cases</title>
        </Head>
        <DeploymentUtils />
        <Layout embed={Boolean(pageProps.embed)}>
          <Component {...pageProps} />
        </Layout>
      </FpjsProvider>
    </Providers>
  );
}

export default CustomApp;
