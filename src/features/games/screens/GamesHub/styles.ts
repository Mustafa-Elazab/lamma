import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.colors.background },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.md,
    },
    header: { gap: theme.spacing.sm, marginBottom: theme.spacing.sm },
    joinCard: { gap: theme.spacing.md, marginTop: theme.spacing.sm },
    joinFields: { gap: theme.spacing.md },
    discoverySection: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
    roomCard: { gap: theme.spacing.sm },
    card: { gap: theme.spacing.md },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconWrap: {
      width: 52,
      height: 52,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleBlock: { flex: 1, gap: 2 },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metaPill: {
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceSoft,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
  });
}
