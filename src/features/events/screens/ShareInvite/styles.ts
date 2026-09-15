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
    banner: {
      width: '100%',
      aspectRatio: 1456 / 656,
      borderRadius: theme.radius.lg,
    },
    footerArt: {
      width: '100%',
      aspectRatio: 680 / 205,
      marginTop: theme.spacing.sm,
      opacity: 0.95,
    },
    inviteCard: {
      alignSelf: 'center',
      width: '72%',
      aspectRatio: 0.7,
      borderRadius: theme.radius.lg,
      overflow: 'hidden',
      ...theme.shadows.card,
    },
    inviteImage: { width: '100%', height: '100%', resizeMode: 'cover' },
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
