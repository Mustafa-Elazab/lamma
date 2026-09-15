import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import React from 'react';

import { lammaColors } from '../design-system/theme/tokens';
import { AppNavigator } from './AppNavigator';
import { linking } from './linking';

const navTheme: NavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: lammaColors.primary,
    background: lammaColors.background,
    card: lammaColors.surface,
    text: lammaColors.text,
    border: lammaColors.border,
    notification: lammaColors.primary,
  },
};

export function RootNavigator(): React.ReactElement {
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <AppNavigator />
    </NavigationContainer>
  );
}
