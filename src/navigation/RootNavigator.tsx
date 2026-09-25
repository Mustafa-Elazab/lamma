import {
  createNavigationContainerRef,
  DefaultTheme,
  StackActions,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { Linking } from 'react-native';
import BootSplash from 'react-native-bootsplash';

import { SplashScreen } from '../app/SplashScreen';
import { useTheme } from '../design-system/theme/ThemeProvider';
import { useAuth, useOnboardingContext } from '../features/auth';
import { OnboardingScreen } from '../features/auth/screens/Onboarding';
import { ProfileSetupScreen } from '../features/profile/screens/ProfileSetup';
import { useProfileSetupGate } from '../features/profile/useProfileSetupGate';
import { trackScreen } from '../services/analytics';
import { reportError } from '../services/crashReporting';
import { setNotificationOpenHandler } from '../services/messaging';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { linking, type PendingLink } from './linking';
import type { RootStackParamList } from './types';
import { usePendingLink } from './usePendingLink';

const navigationRef = createNavigationContainerRef<RootStackParamList>();

function RootContent(): React.ReactElement {
  const { status, user } = useAuth();
  const { checked, completed } = useOnboardingContext();
  const profileGate = useProfileSetupGate(
    status === 'authenticated' ? user : null,
  );
  const gateReady =
    status !== 'loading' && checked && profileGate.status !== 'checking';

  useEffect(() => {
    if (gateReady) {
      // Cross-fade the native bootsplash logo away once auth + onboarding are
      // resolved. Safe to call repeatedly; ignore if not natively initialized.
      BootSplash.hide({ fade: true }).catch(error => {
        reportError(error, 'bootsplash.hide');
      });
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

  if (status !== 'authenticated') {
    return <AuthNavigator />;
  }

  // First sign-in without a display name: optional name + photo, skippable.
  if (profileGate.status === 'needed') {
    return <ProfileSetupScreen onDone={profileGate.complete} />;
  }

  return <AppNavigator />;
}

export function RootNavigator(): React.ReactElement {
  const theme = useTheme();
  const { status } = useAuth();
  const { checked, completed } = useOnboardingContext();
  const routeNameRef = useRef<string | undefined>(undefined);
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
  const appReady = status === 'authenticated' && checked && completed;
  const openPendingLink = useCallback((link: PendingLink): boolean => {
    if (!navigationRef.isReady()) {
      return false;
    }
    if (link.kind === 'event') {
      const current = navigationRef.getCurrentRoute();
      const currentId = (current?.params as { eventId?: string } | undefined)
        ?.eventId;
      if (current?.name === 'EventDetails' && currentId === link.eventId) {
        return true;
      }
      navigationRef.dispatch(
        StackActions.push('EventDetails', { eventId: link.eventId }),
      );
      return true;
    }
    navigationRef.navigate('MainTabs', {
      screen: 'Games',
      params: { screen: 'GameJoin', params: { code: link.code } },
    } as never);
    return true;
  }, []);
  usePendingLink(openPendingLink, appReady);

  useEffect(() => {
    if (!appReady) {
      return;
    }
    return setNotificationOpenHandler(link => Linking.openURL(link));
  }, [appReady]);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={navTheme}
      linking={linking}
      onReady={() => {
        const routeName = navigationRef.getCurrentRoute()?.name;
        routeNameRef.current = routeName;
        if (routeName) {
          void trackScreen(routeName);
        }
      }}
      onStateChange={() => {
        const previousRouteName = routeNameRef.current;
        const currentRouteName = navigationRef.getCurrentRoute()?.name;
        if (currentRouteName && previousRouteName !== currentRouteName) {
          void trackScreen(currentRouteName);
        }
        routeNameRef.current = currentRouteName;
      }}
    >
      <RootContent />
    </NavigationContainer>
  );
}
