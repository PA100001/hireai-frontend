import React, { createContext, useState, useMemo } from 'react';
import { createTheme, ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { lightThemeOptions, darkThemeOptions } from '../theme';

// Export the context directly.
export const ThemeModeContext = createContext({
  // Provide default values matching the provider's value shape
  toggleColorMode: () => {},
  mode: 'light',
});

// This is the component export
export const ThemeModeProvider = ({ children }) => {
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem('themeMode');
    return storedMode === 'dark' || storedMode === 'light' ? storedMode : 'light';
  });

  const colorModeAPI = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('themeMode', newMode);
          return newMode;
        });
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(() => createTheme(mode === 'light' ? lightThemeOptions : darkThemeOptions), [mode]);

  return (
    <ThemeModeContext.Provider value={colorModeAPI}>
      <MUIThemeProvider theme={theme}>{children}</MUIThemeProvider>
    </ThemeModeContext.Provider>
  );
};