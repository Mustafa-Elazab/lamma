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
import { AppIcon, type IconName } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type ThemeSwatchProps = {
  label: string;
  image?: ImageSourcePropType;
  placeholderIcon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  width?: number;
};

function AppThemeSwatchComponent({
  label,
  image,
  placeholderIcon = 'plus',
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
        {image ? (
          <Image source={image} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <AppIcon name={placeholderIcon} size={22} color="primary" />
            <AppIcon name="plus" size={14} color="primary" />
          </View>
        )}
        {selected ? (
          <View style={styles.check}>
            <AppIcon name="check" size={14} color="textInverse" />
          </View>
        ) : null}
      </View>
      <AppText
        variant="caption"
        color={selected ? 'primary' : 'textMuted'}
        weight={selected ? '700' : '500'}
        align="center"
        numberOfLines={1}
      >
        {label}
      </AppText>
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
    image: { width: '100%', height: '100%' },
    placeholder: {
      flex: 1,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
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

export const AppThemeSwatch = React.memo(AppThemeSwatchComponent);
