import {
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import React, { useEffect, useMemo } from 'react';
import BootSplash from 'react-native-bootsplash';

import { SplashScreen } from '../app/SplashScreen';
import { useTheme } from '../design-system/theme/ThemeProvider';
import { useAuth, useOnboardingContext } from '../features/auth';
import { OnboardingScreen } from '../features/auth/screens/Onboarding';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { linking } from './linking';

function RootContent(): React.ReactElement {
  const { status } = useAuth();
  const { checked, completed } = useOnboardingContext();
  const gateReady = status !== 'loading' && checked;

  useEffect(() => {
    if (gateReady) {
      // Cross-fade the native bootsplash logo away once auth + onboarding are
      // resolved. Safe to call repeatedly; ignore if not natively initialized.
      BootSplash.hide({ fade: true }).catch(() => undefined);
    }
  }, [gateReady]);

  if (!gateReady) {
    return <SplashScreen />;
  }

  // Onboarding is a first-run gate that is independent of auth: every new user
  // (guest or social) sees it before Home, and it never re-appears on sign-out.
  if (!completed) {
    return <OnboardingScreen />;
  }

  return status === 'authenticated' ? <AppNavigator /> : <AuthNavigator />;
}

export function RootNavigator(): React.ReactElement {
  const theme = useTheme();
  const navTheme = useMemo<NavTheme>(
    () => ({
      ...DefaultTheme,
      dark: theme.colors.background === '#12131A',
      colors: {
        ...DefaultTheme.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.primary,
      },
    }),
    [theme],
  );
  return (
    <NavigationContainer theme={navTheme} linking={linking}>
      <RootContent />
    </NavigationContainer>
  );
}
