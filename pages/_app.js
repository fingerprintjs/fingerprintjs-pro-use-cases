// @ts-check
import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../client/theme-provider';
import Head from 'next/head';
import { Header } from '../client/components/header';
import { SnackbarProvider } from 'notistack';
import { SnackbarAction } from '../client/components/snackbar-action';
import { SocketProvider } from '../client/api/socket-provider';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { FP_LOAD_OPTIONS } from '../client/use-visitor-data';
import { Paper, Stack } from '@mui/material';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Layout({ children }) {
  return (
    <Stack sx={{ height: '100%' }}>
      <Header />
      <Paper variant='outlined' sx={{ flexGrow: 1, borderRadius: 0, paddingBottom: t => t.spacing(4) }}>{children}</Paper>
    </Stack>
  );
}

function App({ Component, pageProps }) {
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
              <Layout>
                <Component {...pageProps} />
              </Layout>
            </FpjsProvider>
          </SocketProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
