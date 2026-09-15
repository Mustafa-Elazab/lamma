import React, { useMemo } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { AppIcon, type IconName } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';
import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';

export type RsvpButtonProps = {
  label: string;
  icon: IconName;
  active: boolean;
  onPress: () => void;
};

export function AppRsvpButton({
  label,
  icon,
  active,
  onPress,
}: RsvpButtonProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, active && styles.buttonActive]}
    >
      <AppIcon name={icon} size={18} color={active ? 'textInverse' : 'text'} />
      <AppText variant="label" color={active ? 'textInverse' : 'text'}>
        {label}
      </AppText>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    button: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.pill,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    buttonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
  });
}
