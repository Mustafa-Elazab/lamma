import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../design-system/atoms/Text';
import { AppScreenHeader } from '../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type InfoSection = { key: string; title: string; body: string };

type Props = {
  title: string;
  intro?: string;
  meta?: string;
  sections: InfoSection[];
  children?: React.ReactNode;
  testID?: string;
};

/** Shared layout for About / Contact / Terms / Privacy screens. */
export function InfoPageTemplate({
  title,
  intro,
  meta,
  sections,
  children,
  testID,
}: Props): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation();

  return (
    <AppScreenTemplate
      edges={['top']}
      testID={testID}
      header={<AppScreenHeader title={title} onBack={() => navigation.goBack()} />}
    >
      {intro ? (
        <AppText variant="body" color="textMuted">
          {intro}
        </AppText>
      ) : null}
      {children}
      {sections.map(section => (
        <View key={section.key} style={styles.section}>
          <AppText variant="subheading">{section.title}</AppText>
          <AppText variant="body" color="textMuted">
            {section.body}
          </AppText>
        </View>
      ))}
      {meta ? (
        <AppText variant="caption" color="textMuted" align="center">
          {meta}
        </AppText>
      ) : null}
    </AppScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    section: {
      gap: theme.spacing.xs,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      padding: theme.spacing.lg,
    },
  });
}
