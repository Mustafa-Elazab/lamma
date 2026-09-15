import { QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppThemeProvider } from '../design-system/theme/ThemeProvider';
import { AuthProvider, OnboardingProvider, useAuth } from '../features/auth';
import { usePreferences } from '../features/settings/core';
import { LanguageProvider, useLanguage } from './localization';
import { createQueryClient } from './queryClient';

function LocalizationGate({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement | null {
  const { ready } = useLanguage();
  if (!ready) {
    return null;
  }
  return <>{children}</>;
}

function PreferenceThemeProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const { status } = useAuth();
  const { preferences } = usePreferences({
    enabled: status === 'authenticated',
  });
  return (
    <AppThemeProvider
      mode={status === 'authenticated' ? preferences.appearance : 'light'}
    >
      {children}
    </AppThemeProvider>
  );
}

export function AppProviders({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const queryClient = useMemo(() => createQueryClient(), []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <LocalizationGate>
              <AuthProvider>
                <PreferenceThemeProvider>
                  <OnboardingProvider>{children}</OnboardingProvider>
                </PreferenceThemeProvider>
              </AuthProvider>
            </LocalizationGate>
          </LanguageProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
