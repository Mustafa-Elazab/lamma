import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppIcon } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type SectionHeaderProps = {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

function AppSectionHeaderComponent({
  title,
  actionLabel,
  onPressAction,
}: SectionHeaderProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <AppText variant="subheading">{title}</AppText>
      {actionLabel && onPressAction ? (
        <Pressable onPress={onPressAction} hitSlop={8} style={styles.action}>
          <AppText variant="label" color="primary">
            {actionLabel}
          </AppText>
          <AppIcon name="back" size={16} color="primary" strokeWidth={2} forward />
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
  });
}

export const AppSectionHeader = React.memo(AppSectionHeaderComponent);
