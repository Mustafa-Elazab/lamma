import React from 'react';
import { I18nManager, View } from 'react-native';

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
  /**
   * When true, directional icons (currently `back`) flip in RTL so "back"
   * always points toward the previous screen.
   */
  rtlMirror?: boolean;
};

function AppIconComponent({
  name,
  size = 24,
  color = 'text',
  rawColor,
  strokeWidth,
  rtlMirror = name === 'back',
}: IconProps): React.ReactElement {
  const theme = useTheme();
  const SvgIcon = iconRegistry[name];
  const mirror = rtlMirror && I18nManager.isRTL;
  return (
    <View style={mirror ? { transform: [{ scaleX: -1 }] } : undefined}>
      <SvgIcon
        width={size}
        height={size}
        color={rawColor ?? theme.colors[color]}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

export type { IconName };

export const AppIcon = React.memo(AppIconComponent);
