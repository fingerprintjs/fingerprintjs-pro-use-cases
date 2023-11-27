import { createTheme } from '@mui/material/styles';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { FunctionComponent, PropsWithChildren, useMemo } from 'react';

export const ThemeProvider: FunctionComponent<PropsWithChildren> = ({ children }) => {
  const hasDarkMode = false;

  const theme = useMemo(() => {
    const secondary = 'rgba(0, 0, 0, 0.87)';

    return createTheme({
      palette: {
        primary: {
          main: '#FF5D22',
        },
        secondary: {
          main: secondary,
        },
        mode: hasDarkMode ? 'dark' : 'light',
      },
      components: {
        MuiTextField: {
          defaultProps: {
            variant: 'outlined',
          },
        },
      },
      typography: {
        h1: {
          fontSize: '2rem',
          fontWeight: 500,
        },
        h2: {
          fontSize: '1.5rem',
          fontWeight: 500,
        },
        h3: {
          fontSize: '1.25rem',
          fontWeight: 500,
          marginBottom: '1rem',
          marginTop: '1.25rem',
        },
      },
      breakpoints: {
        values: {
          xs: 0,
          sm: 600,
          md: 860,
          lg: 1200,
          xl: 1536,
        },
      },
    });
  }, [hasDarkMode]);

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
};
