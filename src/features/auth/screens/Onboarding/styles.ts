import { I18nManager, StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';
import { letterSpacingFor } from '../../../../utils/direction';

export function createStyles(theme: Theme, width: number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      alignItems: 'center',
      paddingTop: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    logo: { width: 132, height: 48, resizeMode: 'contain' },
    tagline: { letterSpacing: letterSpacingFor(1.5, I18nManager.isRTL) },
    slide: {
      width,
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    heroImage: {
      width: width - theme.spacing.xl * 2,
      height: (width - theme.spacing.xl * 2) * 1.02,
      borderRadius: theme.radius.lg,
      resizeMode: 'cover',
    },
    textBlock: { gap: theme.spacing.sm, alignItems: 'center' },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      marginVertical: theme.spacing.lg,
    },
    dot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.borderStrong,
    },
    dotActive: { backgroundColor: theme.colors.primary },
    footer: {
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.lg,
      gap: theme.spacing.md,
    },
  });
}
