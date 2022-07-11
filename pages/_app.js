import '../styles/globals.css';
import { StyledEngineProvider, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import Head from 'next/head';
import { QueryClient, QueryClientProvider } from 'react-query';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5D22',
    },
    secondary: {
      main: 'rgba(0, 0, 0, 0.87)',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
  },
});

const queryClient = new QueryClient();

function App({ Component, pageProps }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="icon" type="image/x-icon" href="/favicon.ico" />
            <title>FingerprintJS Pro Use Cases</title>
          </Head>

          <Component {...pageProps} />
        </QueryClientProvider>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;
