import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.md,
    },
    titleBlock: { gap: 2 },
    categoryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.md,
    },
    categoryScroll: {
      flexGrow: 0,
      flexShrink: 0,
    },
    chip: { flexShrink: 0 },
    listContent: {
      paddingHorizontal: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    sectionTitle: { marginBottom: theme.spacing.xs },
    stateWrap: { paddingVertical: theme.spacing.xxl },
    footerLoader: { paddingVertical: theme.spacing.lg },
  });
}
