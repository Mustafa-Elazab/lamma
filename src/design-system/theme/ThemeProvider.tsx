import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme, type ColorSchemeName } from 'react-native';

import {
  darkTheme,
  theme as defaultTheme,
  type Theme,
} from './tokens';

const ThemeContext = createContext<Theme>(defaultTheme);

type ThemeProviderProps = {
  theme?: Theme;
  children: React.ReactNode;
};

export function ThemeProvider({
  theme = defaultTheme,
  children,
}: ThemeProviderProps): React.ReactElement {
  const value = useMemo(() => theme, [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export function resolveAppTheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): Theme {
  return mode === 'dark' || (mode === 'system' && systemScheme === 'dark')
    ? darkTheme
    : defaultTheme;
}

export function AppThemeProvider({
  mode,
  children,
}: {
  mode: ThemeMode;
  children: React.ReactNode;
}): React.ReactElement {
  const systemScheme = useColorScheme();
  const activeTheme = resolveAppTheme(mode, systemScheme);
  return <ThemeProvider theme={activeTheme}>{children}</ThemeProvider>;
}

/**
 * Access the active {@link Theme}. Always use this instead of importing tokens
 * directly inside components so future theming (e.g. dark mode) stays trivial.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
