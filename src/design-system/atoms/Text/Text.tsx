import React, { useMemo } from 'react';
import {
  I18nManager,
  StyleSheet,
  Text as RNText,
  type StyleProp,
  type TextProps as RNTextProps,
  type TextStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken, TypographyToken } from '../../theme/tokens';

export type TextProps = RNTextProps & {
  variant?: TypographyToken;
  color?: ColorToken;
  /**
   * Logical alignment. 'left' means the leading edge: under native RTL both
   * iOS and Android render it on the right. Never pass 'right' to get
   * right-aligned Arabic text, native RTL would flip it back to the left.
   */
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

function AppTextComponent({
  variant = 'body',
  color = 'text',
  align,
  weight,
  style,
  children,
  ...rest
}: TextProps): React.ReactElement {
  const theme = useTheme();

  const computed = useMemo<StyleProp<TextStyle>>(() => {
    const token = theme.typography[variant];
    return {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: weight ?? (token.fontWeight as TextStyle['fontWeight']),
      color: theme.colors[color],
      // Leading edge in both directions ('left' is auto-flipped in RTL).
      textAlign: align ?? 'left',
      // Base bidi direction of the paragraph (iOS), so a line that starts
      // with a Latin name or a number still reads right-to-left in Arabic.
      writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
    };
  }, [align, color, theme, variant, weight]);

  return (
    <RNText style={StyleSheet.flatten([computed, style])} {...rest}>
      {children}
    </RNText>
  );
}

export const AppText = React.memo(AppTextComponent);
