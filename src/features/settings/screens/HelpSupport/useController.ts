import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { IconName } from '../../../../design-system/atoms/Icon';
import type { AppStackParamList } from '../../../../navigation/types';

const APP_VERSION = '1.0.0';

export function useHelpSupportController() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();

  const items: { key: string; label: string; icon: IconName; onPress: () => void }[] = [
    {
      key: 'faq',
      label: t('settings.faq'),
      icon: 'help',
      onPress: () => undefined,
    },
    {
      key: 'contact',
      label: t('settings.contactUs'),
      icon: 'comment',
      onPress: () => navigation.navigate('ContactUs'),
    },
    {
      key: 'terms',
      label: t('settings.terms'),
      icon: 'draft',
      onPress: () => navigation.navigate('TermsOfService'),
    },
    {
      key: 'privacy',
      label: t('settings.privacy'),
      icon: 'shield',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
  ];

  return {
    t,
    items,
    appVersion: APP_VERSION,
    goBack: () => navigation.goBack(),
  };
}
