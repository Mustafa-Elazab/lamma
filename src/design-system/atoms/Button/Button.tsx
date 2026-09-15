import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppIcon, type IconName } from '../Icon';
import { AppText } from '../Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'style' | 'children'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: IconName;
  rightIcon?: IconName;
  style?: StyleProp<ViewStyle>;
};

const heightForSize: Record<ButtonSize, number> = { sm: 40, md: 52, lg: 60 };

function AppButtonComponent({
  label,
  variant = 'primary',
  size = 'lg',
  loading = false,
  fullWidth = true,
  leftIcon,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const isDisabled = disabled || loading;

  const contentColor =
    variant === 'primary'
      ? 'textInverse'
      : variant === 'ghost'
      ? 'primary'
      : 'text';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { height: heightForSize[size] },
        fullWidth && styles.fullWidth,
        styles[variant],
        pressed && !isDisabled && styles[`${variant}Pressed`],
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={theme.colors[contentColor]} />
      ) : (
        <View style={styles.content}>
          {leftIcon ? (
            <AppIcon name={leftIcon} size={20} color={contentColor} />
          ) : null}
          <AppText variant="bodyStrong" color={contentColor}>
            {label}
          </AppText>
          {rightIcon ? (
            <AppIcon name={rightIcon} size={20} color={contentColor} />
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.radius.pill,
      paddingHorizontal: theme.spacing.xl,
    },
    // width: '100%' guarantees a non-zero hit area even when a parent container
    // does not stretch its children (fixes CTAs reporting 0×0 accessible bounds).
    fullWidth: { alignSelf: 'stretch', width: '100%' },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    primary: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.floating,
    },
    primaryPressed: { backgroundColor: theme.colors.primaryPressed },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    secondaryPressed: { backgroundColor: theme.colors.surfaceWarm },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.borderStrong,
    },
    outlinePressed: { backgroundColor: theme.colors.surfaceSoft },
    ghost: { backgroundColor: 'transparent' },
    ghostPressed: { backgroundColor: theme.colors.surfaceSoft },
    disabled: { opacity: 0.5 },
  });
}

export const AppButton = React.memo(AppButtonComponent);
