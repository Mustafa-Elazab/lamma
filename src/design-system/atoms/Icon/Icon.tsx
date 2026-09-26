import React from 'react';
import { I18nManager, View } from 'react-native';

import { iconRegistry, type IconName } from '../../../assets/icons';
import { shouldMirrorIcon } from '../../../utils/direction';
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
   * Mirror the glyph in RTL. Defaults to true for directional glyphs
   * (`back`, `navigation`, `logout`, see DIRECTIONAL_ICONS) so "back" always
   * points toward the previous screen and "continue" toward the next one.
   */
  rtlMirror?: boolean;
  /**
   * Use the `back` glyph as a forward arrow / list chevron: points right in
   * LTR and left in RTL.
   */
  forward?: boolean;
};

function AppIconComponent({
  name,
  size = 24,
  color = 'text',
  rawColor,
  strokeWidth,
  rtlMirror,
  forward = false,
}: IconProps): React.ReactElement {
  const theme = useTheme();
  const SvgIcon = iconRegistry[name];
  // Transforms are the one thing native RTL never mirrors, so glyphs that
  // point somewhere are flipped here (and only here).
  const mirror = shouldMirrorIcon({
    name,
    isRTL: I18nManager.isRTL,
    forward,
    rtlMirror,
  });
  return (
    <View style={mirror ? mirrorStyle : undefined}>
      <SvgIcon
        width={size}
        height={size}
        color={rawColor ?? theme.colors[color]}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}

const mirrorStyle = { transform: [{ scaleX: -1 }] };

export type { IconName };

export const AppIcon = React.memo(AppIconComponent);
