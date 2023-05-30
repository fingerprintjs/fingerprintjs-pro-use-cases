import { createTheme } from '@mui/material/styles';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useUserPreferences } from './api/personalization/use-user-preferences';
import { useMemo } from 'react';

export function ThemeProvider({ children }) {
  const { hasDarkMode } = useUserPreferences();

  const theme = useMemo(() => {
    const secondary = 'rgba(0, 0, 0, 0.87)';
    const headerLight = '#f2f2f7';

    return createTheme({
      palette: {
        header: hasDarkMode ? secondary : headerLight,
        primary: {
          main: '#FF5D22',
        },
        secondary: {
          main: secondary,
        },
        gray: hasDarkMode ? '#bdbdbd' : '#757575',
        headerLight,
        accentBackground: hasDarkMode ? '#171717' : '#fafafa',
        mode: hasDarkMode ? 'dark' : 'light',
        redLight: '#ef9a9a',
        greenLight: '#a5d6a7',
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
    });
  }, [hasDarkMode]);

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
}
