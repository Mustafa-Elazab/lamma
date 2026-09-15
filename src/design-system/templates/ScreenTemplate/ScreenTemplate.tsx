import React, { useMemo } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import {
  SafeAreaView,
  type Edge,
} from 'react-native-safe-area-context';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';

export type ScreenTemplateProps = {
  children: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  edges?: ReadonlyArray<Edge>;
  backgroundColor?: keyof Theme['colors'];
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: React.ComponentProps<typeof ScrollView>['refreshControl'];
  testID?: string;
};

export function ScreenTemplate({
  children,
  header,
  footer,
  scroll = true,
  padded = true,
  edges = ['top', 'bottom'],
  backgroundColor = 'background',
  contentStyle,
  refreshControl,
  testID,
}: ScreenTemplateProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const paddingStyle = padded ? styles.padded : null;
  const body = scroll ? (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[styles.scrollContent, paddingStyle, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, paddingStyle, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView
      edges={edges as Edge[]}
      style={[styles.safe, { backgroundColor: theme.colors[backgroundColor] }]}
      testID={testID}
    >
      {header}
      {body}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    safe: { flex: 1 },
    flex: { flex: 1 },
    padded: { paddingHorizontal: theme.spacing.lg },
    scrollContent: {
      paddingBottom: theme.spacing.xxl,
      gap: theme.spacing.lg,
    },
    footer: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.md,
      paddingBottom: theme.spacing.sm,
    },
  });
}
