import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { useLanguage } from '../../../../app/localization';
import type { AppStackParamList } from '../../../../navigation/types';
import { displayNameOrGuest, useAuth } from '../../../auth';
import { useHomeFeed } from '../../../events';
import { usePreferences } from '../../../settings/core';

export function useProfileController() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const { user, signOut } = useAuth();
  const hosting = useHomeFeed('hosting');
  const { preferences } = usePreferences();

  const hostedCount = useMemo(() => {
    const pages = hosting.data?.pages ?? [];
    const featured = pages[0]?.featured ? 1 : 0;
    return pages.reduce((sum, page) => sum + page.page.events.length, featured);
  }, [hosting.data]);

  const isGuest = Boolean(user?.isAnonymous);
  const name = displayNameOrGuest(user, t('profile.guest'));
  const email = user?.email ?? null;

  const languageLabel = language === 'ar' ? 'العربية' : 'English';
  const appearanceLabel =
    preferences.appearance === 'dark'
      ? t('settings.dark')
      : preferences.appearance === 'system'
      ? t('settings.system')
      : t('settings.light');

  const go = useCallback(
    (route: keyof AppStackParamList) => {
      navigation.navigate(route as 'LanguageSettings');
    },
    [navigation],
  );

  return {
    t,
    name,
    email,
    isGuest,
    avatar: user?.photoURL ? { uri: user.photoURL } : undefined,
    hostedCount,
    languageLabel,
    appearanceLabel,
    goLanguage: () => go('LanguageSettings'),
    goNotifications: () => go('NotificationSettings'),
    goAppearance: () => go('Appearance'),
    goDrafts: () => go('MyDrafts'),
    goSavedThemes: () => go('SavedThemes'),
    goHelp: () => go('HelpSupport'),
    signOut,
  };
}
