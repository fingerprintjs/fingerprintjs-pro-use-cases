import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../shared/client/theme-provider';
import Head from 'next/head';
import { Header } from '../components/personalization/header';
import { SnackbarProvider } from 'notistack';

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
          maxSnack={3}
          autoHideDuration={5000}
          anchorOrigin={{
            horizontal: 'left',
            vertical: 'bottom',
          }}
        >
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <title>Fingerprint Pro Use Cases</title>
          </Head>
          <Header addonRight={Component.headerAddonRight?.()} />
          <Component {...pageProps} />
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
