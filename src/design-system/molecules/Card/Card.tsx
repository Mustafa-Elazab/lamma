import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';

export type CardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  padded?: boolean;
  elevated?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({
  children,
  onPress,
  padded = true,
  elevated = true,
  style,
}: CardProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const content = [
    styles.card,
    padded && styles.padded,
    elevated && theme.shadows.card,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [...content, pressed && styles.pressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={content}>{children}</View>;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    padded: { padding: theme.spacing.lg },
    pressed: { opacity: 0.9 },
  });
}
