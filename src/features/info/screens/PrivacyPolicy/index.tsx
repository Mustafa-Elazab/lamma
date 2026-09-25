import React from 'react';

import { InfoPageTemplate } from '../../components/InfoPageTemplate';
import { usePrivacyController } from './useController';

export function PrivacyPolicyScreen(): React.ReactElement {
  const c = usePrivacyController();
  return (
    <InfoPageTemplate
      testID="privacy-screen"
      title={c.t('info.privacyTitle')}
      intro={c.t('info.privacy.intro')}
      sections={c.sections}
      meta={c.t('info.lastUpdated')}
    />
  );
}
