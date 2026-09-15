import React, { useMemo } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

import { branding } from '../assets';
import { useTheme } from '../design-system/theme/ThemeProvider';
import type { Theme } from '../design-system/theme/tokens';

export function SplashScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <Image source={branding.logo} style={styles.logo} />
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xl,
      backgroundColor: theme.colors.background,
    },
    logo: { width: 180, height: 66, resizeMode: 'contain' },
  });
}
