import { useTranslation } from 'react-i18next';

import type { InfoSection } from '../../components/InfoPageTemplate';
import { CONTACT_EMAIL } from '../../constants';

export function usePrivacyController() {
  const { t } = useTranslation();
  const email = { email: CONTACT_EMAIL };
  const sections: InfoSection[] = [
    { key: 's1', title: t('info.privacy.s1Title'), body: t('info.privacy.s1Body') },
    { key: 's2', title: t('info.privacy.s2Title'), body: t('info.privacy.s2Body') },
    { key: 's3', title: t('info.privacy.s3Title'), body: t('info.privacy.s3Body') },
    { key: 's4', title: t('info.privacy.s4Title'), body: t('info.privacy.s4Body') },
    { key: 's5', title: t('info.privacy.s5Title'), body: t('info.privacy.s5Body') },
    { key: 's6', title: t('info.privacy.s6Title'), body: t('info.privacy.s6Body') },
    { key: 's7', title: t('info.privacy.s7Title'), body: t('info.privacy.s7Body') },
    {
      key: 's8',
      title: t('info.privacy.s8Title'),
      body: t('info.privacy.s8Body', email),
    },
  ];
  return { t, sections };
}
