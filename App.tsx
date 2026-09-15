/**
 * Lamma — plan, invite and celebrate together.
 *
 * @format
 */

import React from 'react';
import { StatusBar } from 'react-native';

import { AppProviders } from './src/app';
import { RootNavigator } from './src/navigation';

function App(): React.ReactElement {
  return (
    <AppProviders>
      <StatusBar barStyle="dark-content" />
      <RootNavigator />
    </AppProviders>
  );
}

export default App;
