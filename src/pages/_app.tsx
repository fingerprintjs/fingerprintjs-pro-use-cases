import '../styles/globals.css';
import '../styles/global-styles.scss';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../client/theme-provider';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { SnackbarAction } from '../client/components/snackbar-action';
import { SocketProvider } from '../client/api/socket-provider';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { FP_LOAD_OPTIONS } from '../client/use-visitor-data';
import { Paper, Stack } from '@mui/material';
import { AppProps } from 'next/app';
import Header from '../client/components/header';
import NewHeader from '../client/components/common/NewHeader';
import { FunctionComponent, PropsWithChildren } from 'react';
import DeploymentUtils from '../client/DeploymentUtils';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const Layout: FunctionComponent<PropsWithChildren<{ embed: boolean }>> = ({ children, embed }) => {
  return (
    <Stack sx={{ height: '100%' }}>
      {embed ? null : <NewHeader />}
      <Paper
        variant="outlined"
        sx={{ flexGrow: 1, borderRadius: 0, border: 'none', paddingBottom: (t) => t.spacing(4) }}
      >
        {children}
      </Paper>
    </Stack>
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
          <SocketProvider>
            <FpjsProvider loadOptions={FP_LOAD_OPTIONS}>
              <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <link rel="icon" type="image/x-icon" href="/favicon.ico" />
                <title>Fingerprint Pro Use Cases</title>
              </Head>
              <DeploymentUtils />
              <Layout embed={pageProps.embed}>
                <Component {...pageProps} />
              </Layout>
            </FpjsProvider>
          </SocketProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default CustomApp;
