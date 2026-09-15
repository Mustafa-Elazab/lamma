import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { useLanguage, type AppLanguage } from '../../../../app/localization';

export function useLanguageSettingsController() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { language, setLanguage } = useLanguage();

  const options: { value: AppLanguage; label: string }[] = [
    { value: 'en', label: t('language.english') },
    { value: 'ar', label: t('language.arabic') },
  ];

  return {
    t,
    options,
    language,
    setLanguage,
    goBack: () => navigation.goBack(),
  };
}
