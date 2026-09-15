import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      aspectRatio: 0.62,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    heroImage: { borderRadius: theme.radius.lg },
    heroOverlay: {
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.overlay,
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
