import React from 'react';

import { iconRegistry, type IconName } from '../../../assets/icons';
import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken } from '../../theme/tokens';

export type IconProps = {
  name: IconName;
  size?: number;
  color?: ColorToken;
  /** Overrides the token color with a raw value (rarely needed). */
  rawColor?: string;
  strokeWidth?: number;
};

function AppIconComponent({
  name,
  size = 24,
  color = 'text',
  rawColor,
  strokeWidth,
}: IconProps): React.ReactElement {
  const theme = useTheme();
  const SvgIcon = iconRegistry[name];
  return (
    <SvgIcon
      width={size}
      height={size}
      color={rawColor ?? theme.colors[color]}
      strokeWidth={strokeWidth}
    />
  );
}

export type { IconName };

export const AppIcon = React.memo(AppIconComponent);
