import React, { useMemo } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

export type ThemeSwatchProps = {
  label: string;
  image: ImageSourcePropType;
  selected?: boolean;
  onPress?: () => void;
  width?: number;
};

export function ThemeSwatch({
  label,
  image,
  selected = false,
  onPress,
  width = 64,
}: ThemeSwatchProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.container, { width }]}
    >
      <View
        style={[
          styles.imageWrap,
          { height: width * 1.35 },
          selected && styles.imageWrapSelected,
        ]}
      >
        <Image source={image} style={styles.image} />
        {selected ? (
          <View style={styles.check}>
            <Icon name="check" size={14} color="textInverse" />
          </View>
        ) : null}
      </View>
      <Text
        variant="caption"
        color={selected ? 'primary' : 'textMuted'}
        weight={selected ? '700' : '500'}
        align="center"
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: { gap: theme.spacing.xs, alignItems: 'center' },
    imageWrap: {
      width: '100%',
      borderRadius: theme.radius.md,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    imageWrapSelected: { borderColor: theme.colors.primary },
    image: { width: '100%', height: '100%', resizeMode: 'cover' },
    check: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
