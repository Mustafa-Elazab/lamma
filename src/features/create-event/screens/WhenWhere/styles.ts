import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.md },
    sectionHeader: { gap: 2 },
    rows: { gap: theme.spacing.sm },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xs,
    },
  });
}
