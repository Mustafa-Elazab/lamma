import React from 'react';

import { InfoPageTemplate } from '../../components/InfoPageTemplate';
import { useTermsController } from './useController';

export function TermsOfServiceScreen(): React.ReactElement {
  const c = useTermsController();
  return (
    <InfoPageTemplate
      testID="terms-screen"
      title={c.t('info.termsTitle')}
      intro={c.t('info.terms.intro')}
      sections={c.sections}
      meta={c.t('info.lastUpdated')}
    />
  );
}
