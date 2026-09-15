import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xl,
      paddingBottom: theme.spacing.xl,
      justifyContent: 'center',
      gap: theme.spacing.lg,
    },
    hero: {
      height: 200,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    heroCircleOne: {
      position: 'absolute',
      top: 20,
      left: 28,
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: theme.colors.surfaceWarm,
    },
    heroCircleTwo: {
      position: 'absolute',
      bottom: 18,
      right: 30,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.primarySoft,
    },
    heroBadge: {
      width: 96,
      height: 96,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.soft,
    },
    heroLogo: { width: 64, height: 64, resizeMode: 'contain' },
    titleBlock: { gap: theme.spacing.xs },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    socials: { gap: theme.spacing.md },
    noPhoneBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.sm },
    footer: { marginTop: theme.spacing.md },
  });
}
