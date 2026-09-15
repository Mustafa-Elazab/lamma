import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { AppButton } from '../../atoms/Button';
import { AppIcon } from '../../atoms/Icon';
import { AppText } from '../../atoms/Text';

export type ErrorStateProps = {
  title?: string;
  message?: string;
  retryLabel?: string;
  onRetry?: () => void;
};

function AppErrorStateComponent({
  title = 'Something went wrong',
  message = 'Please try again in a moment.',
  retryLabel = 'Try again',
  onRetry,
}: ErrorStateProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <AppIcon name="close" size={30} color="error" />
      </View>
      <AppText variant="subheading" align="center">
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" align="center">
        {message}
      </AppText>
      {onRetry ? (
        <AppButton
          label={retryLabel}
          variant="secondary"
          onPress={onRetry}
          fullWidth={false}
          size="md"
          leftIcon="navigation"
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
      backgroundColor: theme.colors.surfaceWarm,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm,
    },
    action: { marginTop: theme.spacing.md },
  });
}

export const AppErrorState = React.memo(AppErrorStateComponent);
