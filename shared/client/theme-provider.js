import { createTheme } from '@mui/material/styles';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useUserPreferences } from '../../pages/personalization/hooks/use-user-preferences';
import { useMemo } from 'react';

export function ThemeProvider({ children }) {
  const { hasDarkMode } = useUserPreferences();

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: hasDarkMode ? 'dark' : 'light',
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
      }),
    [hasDarkMode]
  );

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
}
