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
    fab: {
      position: 'absolute',
      right: theme.spacing.lg,
      bottom: 96,
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    fabButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...theme.shadows.floating,
    },
    stateWrap: { paddingVertical: theme.spacing.xxl },
    loadingCard: {
      height: 120,
      borderRadius: theme.radius.lg,
      marginHorizontal: theme.spacing.lg,
    },
    footerLoader: { paddingVertical: theme.spacing.lg },
  });
}
