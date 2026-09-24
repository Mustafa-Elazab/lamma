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
    const resolvedAlign =
      align ?? (I18nManager.isRTL ? 'right' : 'left');
    return {
      fontSize: token.fontSize,
      lineHeight: token.lineHeight,
      fontWeight: weight ?? (token.fontWeight as TextStyle['fontWeight']),
      color: theme.colors[color],
      textAlign: resolvedAlign,
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
