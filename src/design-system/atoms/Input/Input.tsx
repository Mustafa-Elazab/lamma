import React, { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppIcon, type IconName } from '../Icon';
import { AppText } from '../Text';

export type InputProps = TextInputProps & {
  label?: string;
  helperText?: string;
  errorText?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onPressRightIcon?: () => void;
  counterMax?: number;
  containerStyle?: StyleProp<ViewStyle>;
  /**
   * Content that is always left-to-right (room codes, emails, phone numbers,
   * links): typed text stays LTR and left-aligned even in the Arabic UI.
   */
  ltr?: boolean;
};

function AppInputComponent({
  label,
  helperText,
  errorText,
  leftIcon,
  rightIcon,
  onPressRightIcon,
  counterMax,
  containerStyle,
  ltr = false,
  value,
  onFocus,
  onBlur,
  multiline,
  style,
  ...rest
}: InputProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(errorText);

  return (
    <View style={containerStyle}>
      {label ? (
        <View style={styles.labelRow}>
          <AppText variant="label">{label}</AppText>
          {typeof counterMax === 'number' ? (
            <AppText variant="caption" color="textMuted">
              {`${value?.length ?? 0}/${counterMax}`}
            </AppText>
          ) : null}
        </View>
      ) : null}
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          hasError && styles.fieldError,
        ]}
      >
        {leftIcon ? (
          <AppIcon name={leftIcon} size={20} color="textMuted" />
        ) : null}
        <TextInput
          value={value}
          multiline={multiline}
          placeholderTextColor={theme.colors.textMuted}
          onFocus={e => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={e => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            ltr && styles.inputLtr,
            style,
          ]}
          {...rest}
        />
        {rightIcon ? (
          <Pressable onPress={onPressRightIcon} hitSlop={8}>
            <AppIcon name={rightIcon} size={20} color="textMuted" />
          </Pressable>
        ) : null}
      </View>
      {hasError ? (
        <AppText variant="caption" color="error" style={styles.helper}>
          {errorText}
        </AppText>
      ) : helperText ? (
        <AppText variant="caption" color="textMuted" style={styles.helper}>
          {helperText}
        </AppText>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
      minHeight: 56,
    },
    fieldMultiline: {
      alignItems: 'flex-start',
      paddingVertical: theme.spacing.md,
    },
    fieldFocused: { borderColor: theme.colors.primary },
    fieldError: { borderColor: theme.colors.error },
    input: {
      flex: 1,
      // 'start' is the leading edge on both platforms (right in Arabic).
      // TextInput 'left'/'right' are physical on Android but flipped by
      // native RTL on iOS, so neither works for both.
      textAlign: 'start',
      color: theme.colors.text,
      fontSize: theme.typography.body.fontSize,
      paddingVertical: theme.spacing.md,
    },
    inputMultiline: { minHeight: 88, textAlignVertical: 'top' },
    // Lays the field itself out LTR, so 'start' resolves to the left edge.
    inputLtr: { direction: 'ltr', writingDirection: 'ltr' },
    helper: { marginTop: theme.spacing.xs },
  });
}

export const AppInput = React.memo(AppInputComponent);
