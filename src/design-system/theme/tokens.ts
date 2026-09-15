/**
 * Lamma design tokens.
 *
 * These are the single source of truth for all visual styling. Screens and
 * components MUST consume tokens through the {@link useTheme} hook (or the
 * exported constants) rather than hardcoding raw values.
 */

export const lammaColors = {
  background: '#FFF8F4',
  surface: '#FFFFFF',
  surfaceSoft: '#FFE9EF',
  surfaceWarm: '#FFF0EA',
  primary: '#F34F68',
  primaryPressed: '#D83F58',
  primarySoft: '#FFD6DE',
  accentPeach: '#FFC6AD',
  accentLavender: '#EDE5FF',
  text: '#182235',
  textMuted: '#6D7280',
  textInverse: '#FFFFFF',
  border: '#F2DDE1',
  borderStrong: '#EABCC6',
  shadow: 'rgba(24, 34, 53, 0.12)',
  overlay: 'rgba(24, 34, 53, 0.45)',
  success: '#27A36A',
  warning: '#D88A21',
  error: '#D94545',
} as const;

export type ColorToken = keyof typeof lammaColors;

export const lammaDarkColors: Record<ColorToken, string> = {
  background: '#12131A',
  surface: '#1C1E27',
  surfaceSoft: '#34232C',
  surfaceWarm: '#2B2220',
  primary: '#FF6178',
  primaryPressed: '#E64860',
  primarySoft: '#512934',
  accentPeach: '#724737',
  accentLavender: '#3D3452',
  text: '#FFF9F6',
  textMuted: '#B9B2BE',
  textInverse: '#FFFFFF',
  border: '#38313B',
  borderStrong: '#67505B',
  shadow: 'rgba(0, 0, 0, 0.42)',
  overlay: 'rgba(4, 5, 10, 0.62)',
  success: '#46C98B',
  warning: '#F2AB45',
  error: '#FF6B6B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export type SpacingToken = keyof typeof spacing;

export const radius = {
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export type RadiusToken = keyof typeof radius;

export const typography = {
  title: { fontSize: 42, lineHeight: 48, fontWeight: '800' },
  heading: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  subheading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '500' },
  bodyStrong: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
} as const;

export type TypographyToken = keyof typeof typography;

export const shadows = {
  card: {
    shadowColor: lammaColors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  soft: {
    shadowColor: lammaColors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  floating: {
    shadowColor: lammaColors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 10,
  },
} as const;

export type ShadowToken = keyof typeof shadows;

export type Theme = {
  colors: Record<ColorToken, string>;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  shadows: Record<
    ShadowToken,
    {
      shadowColor: string;
      shadowOffset: { width: number; height: number };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    }
  >;
};

export const theme: Theme = {
  colors: lammaColors,
  spacing,
  radius,
  typography,
  shadows,
};

export const darkTheme: Theme = {
  ...theme,
  colors: lammaDarkColors,
  shadows: {
    card: { ...shadows.card, shadowColor: lammaDarkColors.shadow },
    soft: { ...shadows.soft, shadowColor: lammaDarkColors.shadow },
    floating: { ...shadows.floating, shadowColor: lammaDarkColors.primary },
  },
};
