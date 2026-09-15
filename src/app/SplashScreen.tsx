import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { branding } from '../assets';
import { useTheme } from '../design-system/theme/ThemeProvider';
import type { Theme } from '../design-system/theme/tokens';

/**
 * Animated splash shown while the auth/onboarding gate resolves. The logo fades
 * in and scales up; the native react-native-bootsplash logo is hidden with a
 * cross-fade once the app is ready (see RootNavigator).
 */
export function SplashScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.82)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={styles.container}>
      <Animated.Image
        source={branding.logoTransparent}
        style={[styles.logo, { opacity, transform: [{ scale }] }]}
      />
    </Animated.View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    logo: { width: 200, height: 74, resizeMode: 'contain' },
  });
}
