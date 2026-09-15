import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    listContent: {
      paddingBottom: 140,
      gap: theme.spacing.lg,
    },
    body: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.lg,
    },
    featuredWrap: { paddingHorizontal: theme.spacing.lg },
    compactItem: { paddingHorizontal: theme.spacing.lg },
    sectionWrap: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.xs,
    },
    stateWrap: { paddingVertical: theme.spacing.xxl },
    loadingCard: {
      height: 120,
      borderRadius: theme.radius.lg,
      marginHorizontal: theme.spacing.lg,
    },
    footerLoader: { paddingVertical: theme.spacing.lg },
    createAction: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: theme.spacing.lg,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    createButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      ...theme.shadows.floating,
    },
    createButtonPressed: { backgroundColor: theme.colors.primaryPressed },
  });
}
