import '../styles/globals.css';
import { ThemeProvider } from '@material-ui/core';
import { createTheme } from '@material-ui/core/styles';

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
      <Component {...pageProps} />
    </ThemeProvider>
  );
}

export default App;
