import React, { useMemo } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { ColorToken, Theme } from '../../theme/tokens';
import { AppIcon, type IconName } from '../Icon';
import { AppText } from '../Text';

export type BadgeTone =
  | 'primary'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'accent';

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
};

const toneToColors: Record<
  BadgeTone,
  { bg: ColorToken; fg: ColorToken }
> = {
  primary: { bg: 'surfaceSoft', fg: 'primary' },
  accent: { bg: 'primary', fg: 'textInverse' },
  success: { bg: 'surfaceSoft', fg: 'success' },
  warning: { bg: 'surfaceWarm', fg: 'warning' },
  neutral: { bg: 'surfaceWarm', fg: 'textMuted' },
};

function AppBadgeComponent({
  label,
  tone = 'primary',
  icon,
  style,
}: BadgeProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const colors = toneToColors[tone];

  return (
    <View
      style={[styles.badge, { backgroundColor: theme.colors[colors.bg] }, style]}
    >
      {icon ? <AppIcon name={icon} size={14} color={colors.fg} /> : null}
      <AppText variant="caption" color={colors.fg} weight="700">
        {label}
      </AppText>
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      alignSelf: 'flex-start',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs + 2,
      borderRadius: theme.radius.pill,
    },
  });
}

export const AppBadge = React.memo(AppBadgeComponent);
