import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { EventDetailsScreen } from '../features/events/screens/EventDetails';
import { GuestListScreen } from '../features/events/screens/GuestList';
import { ShareInviteScreen } from '../features/events/screens/ShareInvite';
import { EditProfileScreen } from '../features/profile/screens/EditProfile';
import { AppearanceScreen } from '../features/settings/screens/Appearance';
import { HelpSupportScreen } from '../features/settings/screens/HelpSupport';
import { LanguageSettingsScreen } from '../features/settings/screens/LanguageSettings';
import { MyDraftsScreen } from '../features/settings/screens/MyDrafts';
import { NotificationSettingsScreen } from '../features/settings/screens/NotificationSettings';
import { SavedThemesScreen } from '../features/settings/screens/SavedThemes';
import { CreateEventNavigator } from './CreateEventNavigator';
import { TabNavigator } from './TabNavigator';
import type { AppStackParamList } from './types';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventNavigator}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
      <Stack.Screen name="GuestList" component={GuestListScreen} />
      <Stack.Screen
        name="ShareInvite"
        component={ShareInviteScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <Stack.Screen name="Appearance" component={AppearanceScreen} />
      <Stack.Screen name="MyDrafts" component={MyDraftsScreen} />
      <Stack.Screen name="SavedThemes" component={SavedThemesScreen} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    </Stack.Navigator>
  );
}
