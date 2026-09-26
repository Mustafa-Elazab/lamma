import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    content: { gap: theme.spacing.xl, paddingTop: theme.spacing.xl },
    headerBlock: { gap: theme.spacing.xs, alignItems: 'center' },
    photoBlock: { alignItems: 'center', gap: theme.spacing.sm },
    photoButton: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceSoft,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      borderStyle: 'dashed',
      overflow: 'hidden',
    },
    photo: { width: 120, height: 120, borderRadius: 60 },
    photoActions: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
      alignItems: 'center',
    },
    actions: { gap: theme.spacing.sm },
  });
}
