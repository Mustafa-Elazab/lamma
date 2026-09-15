import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  View,
  type ImageSourcePropType,
} from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppButton } from '../../atoms/Button';
import { AppIcon, type IconName } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type EmptyStateProps = {
  title: string;
  message?: string;
  icon?: IconName;
  image?: ImageSourcePropType;
  actionLabel?: string;
  onAction?: () => void;
};

function AppEmptyStateComponent({
  title,
  message,
  icon = 'calendar',
  image,
  actionLabel,
  onAction,
}: EmptyStateProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {image ? (
        <Image source={image} style={styles.image} />
      ) : (
        <View style={styles.iconCircle}>
          <AppIcon name={icon} size={32} color="primary" />
        </View>
      )}
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      {message ? (
        <AppText variant="body" color="textMuted" align="center">
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          fullWidth={false}
          size="md"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.md,
      padding: theme.spacing.xl,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.colors.surfaceSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    image: {
      width: 160,
      height: 160,
      resizeMode: 'contain',
      marginBottom: theme.spacing.sm,
    },
    action: { marginTop: theme.spacing.md },
  });
}

export const AppEmptyState = React.memo(AppEmptyStateComponent);
