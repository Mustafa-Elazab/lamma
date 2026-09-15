import { resolveAppTheme } from '../ThemeProvider';
import { darkTheme, theme } from '../tokens';

describe('resolveAppTheme', () => {
  it('uses explicit light and dark modes', () => {
    expect(resolveAppTheme('light', 'dark')).toBe(theme);
    expect(resolveAppTheme('dark', 'light')).toBe(darkTheme);
  });

  it('tracks the system color scheme in system mode', () => {
    expect(resolveAppTheme('system', 'dark')).toBe(darkTheme);
    expect(resolveAppTheme('system', 'light')).toBe(theme);
  });
});
