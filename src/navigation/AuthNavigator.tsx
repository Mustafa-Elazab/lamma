import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { WelcomeScreen } from '../features/auth/screens/Welcome';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}
