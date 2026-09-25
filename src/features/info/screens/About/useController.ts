import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import type { InfoSection } from '../../components/InfoPageTemplate';
import { APP_VERSION, WEBSITE_URL } from '../../constants';

export function useAboutController() {
  const { t } = useTranslation();
  const sections: InfoSection[] = [
    { key: 's1', title: t('info.about.s1Title'), body: t('info.about.s1Body') },
    { key: 's2', title: t('info.about.s2Title'), body: t('info.about.s2Body') },
    { key: 's3', title: t('info.about.s3Title'), body: t('info.about.s3Body') },
    { key: 's4', title: t('info.about.s4Title'), body: t('info.about.s4Body') },
  ];
  return {
    t,
    sections,
    version: t('info.version', { version: APP_VERSION }),
    openWebsite: () => void Linking.openURL(WEBSITE_URL),
  };
}
