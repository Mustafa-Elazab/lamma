import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      aspectRatio: 1.15,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
    },
    heroImage: { borderRadius: theme.radius.lg },
    heroOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.xl,
      gap: theme.spacing.sm,
    },
    swatchRow: {
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    themesLabel: { marginBottom: theme.spacing.sm },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
}
