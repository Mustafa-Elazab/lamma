import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '../../../design-system/atoms/Text';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type SocialButtonProps = {
  label: string;
  mark: React.ReactNode;
  tone: 'light' | 'dark';
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
};

export function SocialButton({
  label,
  mark,
  tone,
  loading = false,
  disabled = false,
  onPress,
}: SocialButtonProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDark = tone === 'dark';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isDark ? styles.dark : styles.light,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDark ? '#FFFFFF' : theme.colors.text} />
      ) : (
        <View style={styles.content}>
          <View style={styles.mark}>{mark}</View>
          <Text variant="bodyStrong" color={isDark ? 'textInverse' : 'text'}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      height: 56,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.lg,
    },
    light: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    dark: { backgroundColor: '#111111' },
    pressed: { opacity: 0.85 },
    disabled: { opacity: 0.6 },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
    },
    mark: { width: 20, height: 20 },
  });
}
