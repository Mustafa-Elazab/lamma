import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.xxl,
      paddingTop: theme.spacing.xxl,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    hero: {
      aspectRatio: 1.42,
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
      backgroundColor: theme.colors.accentPeach,
    },
    heroCircleTwo: {
      position: 'absolute',
      bottom: 18,
      right: 30,
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: theme.colors.accentLavender,
    },
    heroBadge: {
      width: '58%',
      aspectRatio: 1.15,
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.soft,
    },
    heroMonogram: {
      width: 106,
      height: 106,
      borderRadius: 53,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
    },
    heroLetter: { fontSize: 36, lineHeight: 42 },
    titleBlock: { gap: theme.spacing.xs, marginTop: theme.spacing.lg },
    welcomeTitle: { fontSize: 36, lineHeight: 42 },
    guestButton: { marginTop: theme.spacing.xxl },
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
