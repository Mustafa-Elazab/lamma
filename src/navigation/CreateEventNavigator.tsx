import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { BasicsScreen } from '../features/create-event/screens/Basics';
import { ChooseThemeScreen } from '../features/create-event/screens/ChooseTheme';
import { PreviewScreen } from '../features/create-event/screens/Preview';
import { WhenWhereScreen } from '../features/create-event/screens/WhenWhere';
import type { CreateEventStackParamList } from './types';

const Stack = createNativeStackNavigator<CreateEventStackParamList>();

export function CreateEventNavigator(): React.ReactElement {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Basics" component={BasicsScreen} />
      <Stack.Screen name="WhenWhere" component={WhenWhereScreen} />
      <Stack.Screen name="ChooseTheme" component={ChooseThemeScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
    </Stack.Navigator>
  );
}
