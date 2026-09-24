import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: {
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    card: { gap: theme.spacing.md },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
    },
    codeBox: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceSoft,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    playerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.colors.success,
    },
    dotOffline: { backgroundColor: theme.colors.textMuted },
    setupLines: { gap: theme.spacing.xs },
    wrapRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    optionList: { gap: theme.spacing.sm },
    promptBox: {
      minHeight: 140,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.lg,
      backgroundColor: theme.colors.surfaceSoft,
      padding: theme.spacing.xl,
    },
    resultBox: {
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceWarm,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    buttonRow: { gap: theme.spacing.sm },
  });
}
