import React, { createContext, useContext, useMemo } from 'react';

import { theme as defaultTheme, type Theme } from './tokens';

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

/**
 * Access the active {@link Theme}. Always use this instead of importing tokens
 * directly inside components so future theming (e.g. dark mode) stays trivial.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
