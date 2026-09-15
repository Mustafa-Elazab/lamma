import React, { useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppAvatar } from '../../atoms/Avatar';
import { AppBadge } from '../../atoms/Badge';
import { AppIcon } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type GuestRowProps = {
  name: string;
  subtitle?: string;
  avatar?: ImageSourcePropType;
  hostLabel?: string;
  onPressMore?: () => void;
};

function AppGuestRowComponent({
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
      <AppAvatar source={avatar} name={name} size={48} />
      <View style={styles.text}>
        <AppText variant="bodyStrong" numberOfLines={1}>
          {name}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted" numberOfLines={1}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {hostLabel ? (
        <AppBadge label={hostLabel} tone="primary" icon="crown" />
      ) : onPressMore ? (
        <Pressable onPress={onPressMore} hitSlop={8}>
          <AppIcon name="more" size={20} color="textMuted" />
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

export const AppGuestRow = React.memo(AppGuestRowComponent);
