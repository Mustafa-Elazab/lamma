import React, { useMemo } from 'react';
import { I18nManager, Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

export type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

export function SectionHeader({
  title,
  actionLabel,
  onPressAction,
}: SectionHeaderProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Text variant="subheading">{title}</Text>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction} hitSlop={8} style={styles.action}>
          <Text variant="label" color="primary">
            {actionLabel}
          </Text>
          <View style={styles.chevron}>
            <Icon name="back" size={16} color="primary" strokeWidth={2} />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    action: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    chevron: { transform: [{ scaleX: I18nManager.isRTL ? 1 : -1 }] },
  });
}
