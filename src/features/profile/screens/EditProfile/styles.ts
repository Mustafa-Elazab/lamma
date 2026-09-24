import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.lg },
    headerBlock: { gap: theme.spacing.xs, alignItems: 'center', textAlign: 'center' },
    heroBadge: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
      marginBottom: theme.spacing.sm,
      ...theme.shadows.floating,
    },
    heroLetter: {
      fontSize: 36,
      lineHeight: 44,
      fontWeight: '800',
      color: theme.colors.textInverse,
    },
    socials: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
    noPhoneBlock: {
      alignItems: 'center',
      textAlign: 'center',
      gap: theme.spacing.xs,
      paddingTop: theme.spacing.md,
    },
    stayGuestButton: {
      marginTop: theme.spacing.xs,
    },
  });
}
