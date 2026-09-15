import { QueryClientProvider } from '@tanstack/react-query';
import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../design-system/theme/ThemeProvider';
import { AuthProvider, OnboardingProvider } from '../features/auth';
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
          <ThemeProvider>
            <LanguageProvider>
              <LocalizationGate>
                <AuthProvider>
                  <OnboardingProvider>{children}</OnboardingProvider>
                </AuthProvider>
              </LocalizationGate>
            </LanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
