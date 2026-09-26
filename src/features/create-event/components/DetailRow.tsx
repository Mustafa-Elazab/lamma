import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon, type IconName } from '../../../design-system/atoms/Icon';
import { AppText } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type DetailRowProps = {
  icon: IconName;
  label: string;
  value: string;
  onPress?: () => void;
  placeholder?: boolean;
};

export function DetailRow({
  icon,
  label,
  value,
  onPress,
  placeholder = false,
}: DetailRowProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.iconWrap}>
        <AppIcon name={icon} size={22} color="primary" />
      </View>
      <View style={styles.text}>
        <AppText variant="caption" color="textMuted">
          {label}
        </AppText>
        <AppText variant="bodyStrong" color={placeholder ? 'textMuted' : 'text'}>
          {value}
        </AppText>
      </View>
      <AppIcon name="back" size={18} color="textMuted" strokeWidth={2} forward />
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.md,
    },
    pressed: { opacity: 0.7 },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1, gap: 2 },
  });
}
