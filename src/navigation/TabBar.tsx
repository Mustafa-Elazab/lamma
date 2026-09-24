import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppIcon, type IconName } from '../design-system/atoms/Icon';
import { AppText } from '../design-system/atoms/Text';
import { useTheme } from '../design-system/theme/ThemeProvider';
import type { Theme } from '../design-system/theme/tokens';
import { unreadCount, useNotifications } from '../features/notifications/core';
import type { TabParamList } from './types';

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Home: 'home',
  Discover: 'search',
  Games: 'group',
  Notifications: 'bell',
  Profile: 'profile',
};

export function TabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const insets = useSafeAreaInsets();
  const { data: notifications } = useNotifications();
  const unreadNotifications = unreadCount(notifications ?? []);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 8 }]}>
      {state.routes.map((route, index) => {
        const routeName = route.name as keyof TabParamList;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : options.title ?? route.name;
        const focused = state.index === index;
        const color = focused ? 'primary' : 'textMuted';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            onPress={onPress}
            style={styles.tab}
          >
            <View>
              <AppIcon name={TAB_ICONS[routeName]} size={24} color={color} />
              {routeName === 'Notifications' && unreadNotifications > 0 ? (
                <View style={styles.badge}>
                  <AppText
                    variant="caption"
                    color="textInverse"
                    allowFontScaling={false}
                    style={styles.badgeText}
                  >
                    {unreadNotifications > 9
                      ? '9+'
                      : String(unreadNotifications)}
                  </AppText>
                </View>
              ) : null}
            </View>
            <AppText
              variant="caption"
              color={color}
              weight={focused ? '700' : '500'}
              numberOfLines={1}
              allowFontScaling={false}
              style={styles.label}
            >
              {label}
            </AppText>
            {focused ? <View style={styles.activeDot} /> : null}
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
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingHorizontal: 2,
    },
    // Smaller than the caption token so "Notifications" stays on a single line.
    label: { fontSize: 10, lineHeight: 13 },
    activeDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.colors.primary,
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      borderWidth: 1.5,
      borderColor: theme.colors.surface,
    },
    badgeText: { fontSize: 9, lineHeight: 12, fontWeight: '700' },
  });
}
