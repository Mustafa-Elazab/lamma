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
import { Text } from '../../atoms/Text';

export type SegmentedTabItem<T extends string> = {
  key: T;
  label: string;
};

export type SegmentedTabsProps<T extends string> = {
  items: ReadonlyArray<SegmentedTabItem<T>>;
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedTabs<T extends string>({
  items,
  value,
  onChange,
  style,
}: SegmentedTabsProps<T>): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={[styles.container, style]}>
      {items.map(item => {
        const active = item.key === value;
        return (
          <Pressable
            key={item.key}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.key)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text
              variant="label"
              color={active ? 'textInverse' : 'textMuted'}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    segment: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radius.pill,
      backgroundColor: theme.colors.surfaceWarm,
    },
    segmentActive: {
      backgroundColor: theme.colors.primary,
      ...theme.shadows.soft,
    },
  });
}
