import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.sm,
    },
    headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
    spacer: { width: 24 },
    tagline: { letterSpacing: 1.2 },
    footerArt: {
      width: '100%',
      height: 100,
      maxHeight: 100,
      flexGrow: 0,
      marginTop: theme.spacing.sm,
      opacity: 0.95,
    },
    inviteCard: {
      alignSelf: 'center',
      width: '100%',
      height: 120,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      backgroundColor: theme.colors.surfaceSoft,
      ...theme.shadows.card,
    },
    inviteImage: { width: '100%', height: 120 },
    inviteCardInner: { width: '100%', height: 120 },
    inviteOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.45)',
      gap: 2,
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.pill,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    linkText: { flex: 1 },
    actionsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: theme.spacing.xl,
    },
    action: { alignItems: 'center', gap: theme.spacing.xs },
    actionDisabled: { opacity: 0.45 },
    actionCircle: {
      width: 60,
      height: 60,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    whatsapp: { backgroundColor: theme.colors.success },
    softCircle: { backgroundColor: theme.colors.surfaceSoft },
    primaryCircle: { backgroundColor: theme.colors.primary },
    messageCard: {
      backgroundColor: theme.colors.surfaceSoft,
      borderRadius: theme.radius.md,
      padding: theme.spacing.lg,
      gap: theme.spacing.xs,
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
}
