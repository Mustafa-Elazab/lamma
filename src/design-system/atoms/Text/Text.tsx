import React, { useMemo } from 'react';
import {
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
  align?: TextStyle['textAlign'];
  weight?: TextStyle['fontWeight'];
};

export function Text({
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
      textAlign: align,
    };
  }, [align, color, theme, variant, weight]);

  return (
    <RNText style={StyleSheet.flatten([computed, style])} {...rest}>
      {children}
    </RNText>
  );
}
