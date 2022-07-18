import { createTheme } from '@mui/material/styles';
import { StyledEngineProvider, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useUserPreferences } from '../../pages/personalization/hooks/use-user-preferences';
import { useMemo } from 'react';

export function ThemeProvider({ children }) {
  const { hasDarkMode } = useUserPreferences();

  const theme = useMemo(() => {
    const secondary = 'rgba(0, 0, 0, 0.87)';

    return createTheme({
      palette: {
        header: hasDarkMode ? '#f2f2f7' : secondary,
        primary: {
          main: '#FF5D22',
        },
        secondary: {
          main: secondary,
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
  }, [hasDarkMode]);

  console.log({ theme });

  return (
    <StyledEngineProvider injectFirst>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </StyledEngineProvider>
  );
}
