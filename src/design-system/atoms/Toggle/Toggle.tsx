import React from 'react';
import { Switch } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';

export type ToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function Toggle({
  value,
  onValueChange,
  disabled = false,
}: ToggleProps): React.ReactElement {
  const theme = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.primary,
      }}
      thumbColor={theme.colors.surface}
      ios_backgroundColor={theme.colors.border}
    />
  );
}
