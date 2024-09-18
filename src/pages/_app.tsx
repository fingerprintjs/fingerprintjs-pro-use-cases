import '../styles/global-styles.scss';
import Head from 'next/head';
import { AppProps } from 'next/app';
import Providers from '../Providers';
import { Layout } from '../Layout';

export type CustomPageProps = { embed?: boolean };

function CustomApp({ Component, pageProps }: AppProps<CustomPageProps>) {
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
        <link rel='icon' type='image/x-icon' href='/favicon.ico' />
        <title>Fingerprint Pro Use Cases</title>
      </Head>
      <Providers>
        <Layout embed={Boolean(pageProps.embed)}>
          <Component {...pageProps} />
        </Layout>
      </Providers>
    </>
  );
}

export default CustomApp;
