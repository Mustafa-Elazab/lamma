import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';

import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { Text } from '../../../../design-system/atoms/Text';
import type { AppStackParamList } from '../../../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'ShareInvite'>;

export function ShareInviteScreen({ route }: Props): React.ReactElement {
  return (
    <ScreenTemplate>
      <Text variant="heading">Share invite · {route.params.eventId}</Text>
    </ScreenTemplate>
  );
}
