import { StyleSheet } from 'react-native';

import type { Theme } from '../../../../design-system/theme/tokens';

export function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: { gap: theme.spacing.md },
    socials: { gap: theme.spacing.sm, marginTop: theme.spacing.sm },
  });
}
