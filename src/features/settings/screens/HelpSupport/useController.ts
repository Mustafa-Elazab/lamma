import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import type { IconName } from '../../../../design-system/atoms/Icon';

const APP_VERSION = '1.0.0';

export function useHelpSupportController() {
  const { t } = useTranslation();
  const navigation = useNavigation();

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
      onPress: () => void Linking.openURL('mailto:hello@lamma.app'),
    },
    {
      key: 'terms',
      label: t('settings.terms'),
      icon: 'draft',
      onPress: () => undefined,
    },
    {
      key: 'privacy',
      label: t('settings.privacy'),
      icon: 'shield',
      onPress: () => undefined,
    },
  ];

  return {
    t,
    items,
    appVersion: APP_VERSION,
    goBack: () => navigation.goBack(),
  };
}
