import { useTranslation } from 'react-i18next';

import type { InfoSection } from '../../components/InfoPageTemplate';
import { CONTACT_EMAIL } from '../../constants';

export function useTermsController() {
  const { t } = useTranslation();
  const email = { email: CONTACT_EMAIL };
  const sections: InfoSection[] = [
    { key: 's1', title: t('info.terms.s1Title'), body: t('info.terms.s1Body') },
    { key: 's2', title: t('info.terms.s2Title'), body: t('info.terms.s2Body') },
    { key: 's3', title: t('info.terms.s3Title'), body: t('info.terms.s3Body') },
    { key: 's4', title: t('info.terms.s4Title'), body: t('info.terms.s4Body') },
    { key: 's5', title: t('info.terms.s5Title'), body: t('info.terms.s5Body') },
    { key: 's6', title: t('info.terms.s6Title'), body: t('info.terms.s6Body') },
    { key: 's7', title: t('info.terms.s7Title'), body: t('info.terms.s7Body') },
    {
      key: 's8',
      title: t('info.terms.s8Title'),
      body: t('info.terms.s8Body', email),
    },
  ];
  return { t, sections };
}
