/**
 * Lamma — plan, invite and celebrate together.
 *
 * @format
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';

import { AppProviders, useLanguage } from './src/app';
import { GlobalErrorBoundary } from './src/app/GlobalErrorBoundary';
import { useTheme } from './src/design-system/theme/ThemeProvider';
import { useAuth } from './src/features/auth';
import { RootNavigator } from './src/navigation';
import { setAnalyticsIdentity } from './src/services/analytics';
import {
  initializeCrashReporting,
  reportError,
  setCrashIdentity,
} from './src/services/crashReporting';
import { initializeMessaging } from './src/services/messaging';
import { initializeRemoteConfig } from './src/services/remoteConfig';

// Before the first render so render-time errors are captured too.
initializeCrashReporting();

/** Keeps the Analytics / Crashlytics user id and attributes in sync with auth. */
function TelemetryIdentity(): null {
  const { user, status } = useAuth();
  const { language } = useLanguage();
  const userId = user?.uid ?? null;
  const accountType = !user
    ? 'signed_out'
    : user.isAnonymous
      ? 'guest'
      : 'signed_in';
  useEffect(() => {
    if (status === 'loading') {
      return;
    }
    const identity = { userId, accountType, language } as const;
    setCrashIdentity(identity);
    void setAnalyticsIdentity(identity);
  }, [accountType, language, status, userId]);
  return null;
}

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
        <TelemetryIdentity />
        <ThemedStatusBar />
        <RootNavigator />
      </GlobalErrorBoundary>
    </AppProviders>
  );
}

export default App;
