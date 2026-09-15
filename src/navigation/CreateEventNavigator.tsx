import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import {
  BasicsScreen,
  ChooseThemeScreen,
  CreateEventProvider,
  PreviewScreen,
  WhenWhereScreen,
} from '../features/create-event';
import type { CreateEventStackParamList } from './types';

const Stack = createNativeStackNavigator<CreateEventStackParamList>();

export function CreateEventNavigator(): React.ReactElement {
  return (
    <CreateEventProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Basics" component={BasicsScreen} />
        <Stack.Screen name="WhenWhere" component={WhenWhereScreen} />
        <Stack.Screen name="ChooseTheme" component={ChooseThemeScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
      </Stack.Navigator>
    </CreateEventProvider>
  );
}
