import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

export type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({
  title,
  subtitle,
  onBack,
  right,
}: ScreenHeaderProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={8} style={styles.side}>
          <Icon name="back" size={24} />
        </Pressable>
      ) : (
        <View style={styles.side} />
      )}
      <View style={styles.center}>
        <Text variant="subheading" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={styles.side}>{right}</View>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
    },
    side: { width: 40, alignItems: 'center', justifyContent: 'center' },
    center: { flex: 1, alignItems: 'center', gap: 2 },
  });
}
