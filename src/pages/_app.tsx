import '../styles/globals.css';
import '../styles/global-styles.scss';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../client/theme-provider';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { SnackbarAction } from '../client/components/snackbar-action';
import { FpjsProvider, LoadOptions } from '@fingerprintjs/fingerprintjs-pro-react';
import { Paper } from '@mui/material';
import { AppProps } from 'next/app';
import NewHeader from '../client/components/common/Header/Header';
import { FunctionComponent, PropsWithChildren } from 'react';
import DeploymentUtils from '../client/DeploymentUtils';
import Footer from '../client/components/common/Footer/Footer';
import styles from '../styles/layout.module.scss';
import { PUBLIC_API_KEY, SCRIPT_URL_PATTERN, ENDPOINT, FRONTEND_REGION, CUSTOM_TLS_ENDPOINT } from '../server/const';
import { FingerprintJSPro } from '@fingerprintjs/fingerprintjs-pro-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const FP_LOAD_OPTIONS: LoadOptions = {
  apiKey: PUBLIC_API_KEY,
  scriptUrlPattern: [SCRIPT_URL_PATTERN, FingerprintJSPro.defaultScriptUrlPattern],
  endpoint: [ENDPOINT, FingerprintJSPro.defaultEndpoint],
  region: FRONTEND_REGION,
  tlsEndpoint: CUSTOM_TLS_ENDPOINT,
};

const Layout: FunctionComponent<PropsWithChildren<{ embed: boolean }>> = ({ children, embed }) => {
  return (
    <div className={styles.layout}>
      {embed ? null : <NewHeader />}
      <Paper variant="outlined" sx={{ flexGrow: 1, borderRadius: 0, border: 'none' }}>
        {children}
      </Paper>
      {embed ? null : <Footer />}
    </div>
  );
};

export type CustomPageProps = { embed?: boolean };

function CustomApp({ Component, pageProps }: AppProps<CustomPageProps>) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SnackbarProvider
          action={(snackbarId) => <SnackbarAction snackbarId={snackbarId} />}
          maxSnack={3}
          autoHideDuration={5000}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'bottom',
          }}
        >
          <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="icon" type="image/x-icon" href="/favicon.ico" />
              <title>Fingerprint Pro Use Cases</title>
            </Head>
            <DeploymentUtils />
            <Layout embed={Boolean(pageProps.embed)}>
              <Component {...pageProps} />
            </Layout>
          </FpjsProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default CustomApp;
