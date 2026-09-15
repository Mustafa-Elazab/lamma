import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { DiscoverScreen } from '../features/discover/screens/Discover';
import { HomeScreen } from '../features/home/screens/Home';
import { NotificationsScreen } from '../features/notifications/screens/Notifications';
import { ProfileScreen } from '../features/profile/screens/Profile';
import { TabBar } from './TabBar';
import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

/** Rendered only as a navigation target; the tab press is intercepted. */
function CreatePlaceholder(): React.ReactElement | null {
  return null;
}

function renderTabBar(props: BottomTabBarProps): React.ReactElement {
  return <TabBar {...props} unreadNotifications={2} />;
}

export function TabNavigator(): React.ReactElement {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={renderTabBar}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('tabs.home') }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ title: t('tabs.discover') }}
      />
      <Tab.Screen
        name="Create"
        component={CreatePlaceholder}
        options={{ title: t('tabs.create') }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: t('tabs.notifications') }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('tabs.profile') }}
      />
    </Tab.Navigator>
  );
}
