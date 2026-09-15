/**
 * Lamma — plan, invite and celebrate together.
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { AppProviders } from './src/app';
import { GlobalErrorBoundary } from './src/app/GlobalErrorBoundary';
import { useTheme } from './src/design-system/theme/ThemeProvider';
import { RootNavigator } from './src/navigation';
import { reportError } from './src/services/crashReporting';
import { initializeMessaging } from './src/services/messaging';
import { initializeRemoteConfig } from './src/services/remoteConfig';

function ThemedStatusBar(): React.ReactElement {
  const theme = useTheme();
  const dark = theme.colors.background === '#12131A';
  return (
    <StatusBar
      barStyle={dark ? 'light-content' : 'dark-content'}
    />
  );
}

function AppServices(): null {
  useEffect(() => {
    let active = true;
    let unsubscribeMessaging: (() => void) | undefined;

    void initializeRemoteConfig();
    void initializeMessaging()
      .then(unsubscribe => {
        if (active) {
          unsubscribeMessaging = unsubscribe;
        } else {
          unsubscribe();
        }
      })
      .catch(error => reportError(error, 'app.messaging-bootstrap'));

    return () => {
      active = false;
      unsubscribeMessaging?.();
    };
  }, []);
  return null;
}

function App(): React.ReactElement {
  return (
    <AppProviders>
      <GlobalErrorBoundary>
        <AppServices />
        <ThemedStatusBar />
        <RootNavigator />
      </GlobalErrorBoundary>
    </AppProviders>
  );
}

export default App;
