import { useTranslation } from 'react-i18next';
import { Alert, Linking } from 'react-native';

import { CONTACT_EMAIL } from '../../constants';

export function useContactController() {
  const { t } = useTranslation();

  const sendEmail = async () => {
    const subject = encodeURIComponent(t('info.contact.emailSubject'));
    try {
      await Linking.openURL(`mailto:${CONTACT_EMAIL}?subject=${subject}`);
    } catch {
      Alert.alert(
        t('info.contactTitle'),
        t('info.contact.emailError', { email: CONTACT_EMAIL }),
      );
    }
  };

  return {
    t,
    email: CONTACT_EMAIL,
    sendEmail,
    sections: [
      {
        key: 'report',
        title: t('info.contact.reportTitle'),
        body: t('info.contact.reportBody'),
      },
    ],
  };
}
