import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppText } from '../Text';

export type AvatarProps = {
  source?: ImageSourcePropType;
  name?: string;
  size?: number;
  showStatus?: boolean;
};

function initialsFrom(name?: string): string {
  if (!name) {
    return '?';
  }
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map(p => p.charAt(0).toUpperCase()).join('');
}

function AppAvatarComponent({
  source,
  name,
  size = 44,
  showStatus = false,
}: AvatarProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dimension = { width: size, height: size, borderRadius: size / 2 };
  const statusSize = Math.max(10, size * 0.28);

  return (
    <View style={[styles.wrapper, dimension]}>
      {source ? (
        <Image source={source} style={[styles.image, dimension]} />
      ) : (
        <View style={[styles.fallback, dimension]}>
          <AppText
            variant="label"
            color="primary"
            style={{ fontSize: Math.max(11, size * 0.36) }}
          >
            {initialsFrom(name)}
          </AppText>
        </View>
      )}
      {showStatus ? (
        <View
          style={[
            styles.status,
            {
              width: statusSize,
              height: statusSize,
              borderRadius: statusSize / 2,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    wrapper: { position: 'relative' },
    image: { resizeMode: 'cover' },
    fallback: {
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    status: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.success,
      borderWidth: 2,
      borderColor: theme.colors.surface,
    },
  });
}

export { initialsFrom };

export const AppAvatar = React.memo(AppAvatarComponent);
