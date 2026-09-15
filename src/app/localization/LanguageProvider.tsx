import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { I18nManager } from 'react-native';

import {
  createI18n,
  isRTLLanguage,
  SUPPORTED_LANGUAGES,
  type AppLanguage,
} from './i18n';

const STORAGE_KEY = 'lamma.language';

type LanguageContextValue = {
  language: AppLanguage;
  isRTL: boolean;
  ready: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

function resolveInitialLanguage(): AppLanguage {
  return I18nManager.isRTL ? 'ar' : 'en';
}

export function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const [language, setLanguageState] = useState<AppLanguage>(
    resolveInitialLanguage,
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      const stored = (await AsyncStorage.getItem(STORAGE_KEY)) as
        | AppLanguage
        | null;
      const initial =
        stored && SUPPORTED_LANGUAGES.includes(stored)
          ? stored
          : resolveInitialLanguage();
      createI18n(initial);
      const shouldBeRTL = isRTLLanguage(initial);
      if (I18nManager.isRTL !== shouldBeRTL) {
        I18nManager.allowRTL(shouldBeRTL);
        I18nManager.forceRTL(shouldBeRTL);
      }
      if (active) {
        setLanguageState(initial);
        setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const setLanguage = useCallback(async (next: AppLanguage) => {
    await AsyncStorage.setItem(STORAGE_KEY, next);
    const { i18n } = await import('./i18n');
    await i18n.changeLanguage(next);
    setLanguageState(next);
    const shouldBeRTL = isRTLLanguage(next);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.allowRTL(shouldBeRTL);
      I18nManager.forceRTL(shouldBeRTL);
    }
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      isRTL: isRTLLanguage(language),
      ready,
      setLanguage,
    }),
    [language, ready, setLanguage],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
