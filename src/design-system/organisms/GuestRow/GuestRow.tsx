import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Avatar } from '../../atoms/Avatar';
import { Badge } from '../../atoms/Badge';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

export type GuestRowProps = {
  name: string;
  subtitle?: string;
  avatar?: ImageSourcePropType;
  hostLabel?: string;
  onPressMore?: () => void;
};

export function GuestRow({
  name,
  subtitle,
  avatar,
  hostLabel,
  onPressMore,
}: GuestRowProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.row}>
      <Avatar source={avatar} name={name} size={48} />
      <View style={styles.text}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {subtitle ? (
          <Text variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {hostLabel ? (
        <Badge label={hostLabel} tone="primary" icon="crown" />
      ) : onPressMore ? (
        <Pressable onPress={onPressMore} hitSlop={8}>
          <Icon name="more" size={20} color="textMuted" />
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
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
    },
    text: { flex: 1, gap: 2 },
  });
}
