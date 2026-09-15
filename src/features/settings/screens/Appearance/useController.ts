import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { IconName } from '../../../../design-system/atoms/Icon';
import { usePreferences, type AppearanceMode } from '../../core';

export function useAppearanceController() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const options: { value: AppearanceMode; label: string; icon: IconName }[] = [
    { value: 'light', label: t('settings.light'), icon: 'sun' },
    { value: 'dark', label: t('settings.dark'), icon: 'sun' },
    { value: 'system', label: t('settings.system'), icon: 'settings' },
  ];

  const setAppearance = (mode: AppearanceMode) => {
    update({ ...preferences, appearance: mode });
  };

  return {
    t,
    options,
    currentAppearance: preferences.appearance,
    setAppearance,
    goBack: () => navigation.goBack(),
  };
}
