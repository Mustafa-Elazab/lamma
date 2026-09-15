import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { OnboardingScreen } from '../features/auth/screens/Onboarding';
import { WelcomeScreen } from '../features/auth/screens/Welcome';
import { useOnboardingContext } from '../features/auth';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator(): React.ReactElement {
  const { completed } = useOnboardingContext();

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={completed ? 'Welcome' : 'Onboarding'}
    >
      {!completed ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
    </Stack.Navigator>
  );
}
