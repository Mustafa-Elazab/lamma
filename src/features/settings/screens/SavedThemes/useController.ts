import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { type EventThemeKey } from '../../../events';
import { toggleTheme, usePreferences } from '../../core';

const ALL_THEMES: EventThemeKey[] = [
  'wedding',
  'birthday',
  'dinner',
  'travel',
  'generic',
];

export function useSavedThemesController() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const onToggle = (key: EventThemeKey) => {
    update({
      ...preferences,
      savedThemes: toggleTheme(preferences.savedThemes, key),
    });
  };

  const themeItems = ALL_THEMES.map(key => ({
    key,
    label: t(`themeNames.${key}`),
    saved: preferences.savedThemes.includes(key),
  }));

  return {
    t,
    themeItems,
    onToggle,
    goBack: () => navigation.goBack(),
  };
}
