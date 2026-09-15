/**
 * Lamma — plan, invite and celebrate together.
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';

import { AppProviders } from './src/app';
import { useTheme } from './src/design-system/theme/ThemeProvider';
import { RootNavigator } from './src/navigation';

function ThemedStatusBar(): React.ReactElement {
  const theme = useTheme();
  const dark = theme.colors.background === '#12131A';
  return (
    <StatusBar
      barStyle={dark ? 'light-content' : 'dark-content'}
    />
  );
}

function App(): React.ReactElement {
  return (
    <AppProviders>
      <ThemedStatusBar />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
