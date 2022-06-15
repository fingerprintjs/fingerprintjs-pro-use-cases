import '../styles/globals.css';
import { ThemeProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';
import Head from 'next/head';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FF5D22',
    },
    secondary: {
      main: 'rgba(0, 0, 0, 0.87)',
    },
  },
});

function App({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <title>FingerprintJS Pro Use Cases</title>
      </Head>

      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default App;
