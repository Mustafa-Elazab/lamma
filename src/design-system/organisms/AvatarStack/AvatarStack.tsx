import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppAvatar } from '../../atoms/Avatar';
import { AppText } from '../../atoms/Text';
import { overflowLabel } from '../../../utils/format';
import type { ImageSourcePropType } from 'react-native';

export type StackAvatar = {
  id: string;
  name?: string;
  source?: ImageSourcePropType;
};

export type AvatarStackProps = {
  avatars: ReadonlyArray<StackAvatar>;
  total?: number;
  max?: number;
  size?: number;
};

function AppAvatarStackComponent({
  avatars,
  total,
  max = 5,
  size = 32,
}: AvatarStackProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const shown = avatars.slice(0, max);
  const overflow = overflowLabel(total ?? avatars.length, shown.length);
  const overlap = size * 0.32;

  return (
    <View style={styles.row}>
      {shown.map((avatar, index) => (
        <View
          key={avatar.id}
          style={[
            styles.avatarWrap,
            { marginLeft: index === 0 ? 0 : -overlap },
          ]}
        >
          <AppAvatar source={avatar.source} name={avatar.name} size={size} />
        </View>
      ))}
      {overflow ? (
        <View
          style={[
            styles.overflow,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              marginLeft: -overlap,
            },
          ]}
        >
          <AppText variant="caption" color="textMuted" weight="700">
            {overflow}
          </AppText>
        </View>
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'center' },
    avatarWrap: {
      borderWidth: 2,
      borderColor: theme.colors.surface,
      borderRadius: 999,
    },
    overflow: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surfaceWarm,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
  });
}

export const AppAvatarStack = React.memo(AppAvatarStackComponent);
