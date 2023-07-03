import '../styles/globals.css';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from '../client/theme-provider';
import Head from 'next/head';
import { SnackbarProvider } from 'notistack';
import { SnackbarAction } from '../client/components/snackbar-action';
import { SocketProvider } from '../client/api/socket-provider';
import { FpjsProvider } from '@fingerprintjs/fingerprintjs-pro-react';
import { FP_LOAD_OPTIONS } from '../client/use-visitor-data';
import { Paper, Stack } from '@mui/material';
import App, { AppContext, AppProps } from 'next/app';
import Header from '../client/components/header';
import { FunctionComponent, PropsWithChildren } from 'react';

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
      {embed ? null : <Header />}
      <Paper
        variant="outlined"
        sx={{ flexGrow: 1, borderRadius: 0, border: 'none', paddingBottom: (t) => t.spacing(4) }}
      >
        {children}
      </Paper>
    </Stack>
  );
};

type AppOwnProps = { embed?: boolean };

function CustomApp({ Component, pageProps, embed }: AppProps & AppOwnProps) {
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
              {/* Internal placeholder for deployment purposes, unrelated to any examples, please ignore */}
              <div id="deployment-placeholder" />
              {/* <Layout embed={pageProps.embed}> */}
              <Layout embed={embed}>
                <Component {...pageProps} />
              </Layout>
            </FpjsProvider>
          </SocketProvider>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

CustomApp.getInitialProps = async (context: AppContext) => {
  const ctx = await App.getInitialProps(context);
  const embed = context.router.query.embed !== undefined;
  console.log(context);

  return { ...ctx, embed };
};

export default CustomApp;
