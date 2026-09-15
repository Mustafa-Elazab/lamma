import React from 'react';

import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { Text } from '../../../../design-system/atoms/Text';

export function BasicsScreen(): React.ReactElement {
  return (
    <ScreenTemplate>
      <Text variant="heading">Create event · Basics</Text>
    </ScreenTemplate>
  );
}
