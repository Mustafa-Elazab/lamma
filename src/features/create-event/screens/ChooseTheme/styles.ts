import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      maxWidth: 420,
      aspectRatio: 1 / 1.35,
      alignSelf: 'center',
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
    },
    heroImage: {
      borderRadius: theme.radius.lg,
    },
    heroOverlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
      padding: theme.spacing.xl,
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.overlay,
    },
    swatchRow: {
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
  });
}
