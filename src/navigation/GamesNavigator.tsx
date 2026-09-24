import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  GameJoinScreen,
  GameLobbyScreen,
  GamesHubScreen,
} from '../features/games';
import type { GamesStackParamList } from './types';

const Stack = createNativeStackNavigator<GamesStackParamList>();

export function GamesNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GamesHub" component={GamesHubScreen} />
      <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
      <Stack.Screen name="GameJoin" component={GameJoinScreen} />
    </Stack.Navigator>
  );
}
