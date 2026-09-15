import React from 'react';

import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { Text } from '../../../../design-system/atoms/Text';

export function HomeScreen(): React.ReactElement {
  return (
    <ScreenTemplate>
      <Text variant="heading">Home</Text>
    </ScreenTemplate>
  );
}
