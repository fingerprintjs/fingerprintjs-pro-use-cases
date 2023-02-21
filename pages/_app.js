import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../client/theme-provider';
import Head from 'next/head';
import { Header } from '../client/components/header';
import { SnackbarProvider } from 'notistack';
import { SnackbarAction } from '../client/components/snackbar-action';
import { SocketProvider } from '../client/api/socket-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

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
            <Head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <link rel="icon" type="image/x-icon" href="/favicon.ico" />
              <title>Fingerprint Pro Use Cases</title>
            </Head>
            <Header addonRight={Component.headerAddonRight?.()} />
            <Component {...pageProps} />
          </SocketProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
