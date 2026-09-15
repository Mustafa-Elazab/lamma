import React, { useMemo } from 'react';
import {
  I18nManager,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken, Theme } from '../../theme/tokens';
import { AppIcon, type IconName } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type ListItemProps = {
  title: string;
  subtitle?: string;
  leadingIcon?: IconName;
  leadingIconColor?: ColorToken;
  leadingIconBg?: ColorToken;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

function AppListItemComponent({
  title,
  subtitle,
  leadingIcon,
  leadingIconColor = 'primary',
  leadingIconBg = 'surfaceSoft',
  leading,
  trailing,
  showChevron = false,
  onPress,
  style,
}: ListItemProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const body = (
    <>
      {leading ??
        (leadingIcon ? (
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: theme.colors[leadingIconBg] },
            ]}
          >
            <AppIcon name={leadingIcon} size={20} color={leadingIconColor} />
          </View>
        ) : null)}
      <View style={styles.text}>
        <AppText variant="bodyStrong">{title}</AppText>
        {subtitle ? (
          <AppText variant="caption" color="textMuted">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing}
      {showChevron ? (
        <View style={styles.chevron}>
          <AppIcon name="back" size={18} color="textMuted" strokeWidth={2} />
        </View>
      ) : null}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          pressed && styles.pressed,
          style,
        ]}
      >
        {body}
      </Pressable>
    );
  }
  return <View style={[styles.row, style]}>{body}</View>;
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    pressed: { opacity: 0.6 },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: { flex: 1, gap: 2 },
    chevron: { transform: [{ scaleX: I18nManager.isRTL ? 1 : -1 }] },
  });
}

export const AppListItem = React.memo(AppListItemComponent);
