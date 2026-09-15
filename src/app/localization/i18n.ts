import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './resources/en';
import { ar } from './resources/ar';

export const SUPPORTED_LANGUAGES = ['en', 'ar'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const RTL_LANGUAGES: ReadonlyArray<AppLanguage> = ['ar'];

export const defaultNS = 'translation';

export function isRTLLanguage(language: AppLanguage): boolean {
  return RTL_LANGUAGES.includes(language);
}

export function createI18n(initialLanguage: AppLanguage) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    lng: initialLanguage,
    fallbackLng: 'en',
    defaultNS,
    interpolation: { escapeValue: false },
    returnNull: false,
    compatibilityJSON: 'v4',
  });
  return i18n;
}

export { i18n };
