import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    hero: {
      width: '100%',
      aspectRatio: 0.7,
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
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    detailText: { flex: 1, gap: 2 },
    visibilityRow: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
      marginTop: theme.spacing.sm,
    },
    visibilityOption: {
      flex: 1,
      padding: theme.spacing.md,
      borderRadius: theme.radius.md,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      gap: theme.spacing.xs,
    },
    visibilityOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.surfaceSoft,
    },
  });
}
