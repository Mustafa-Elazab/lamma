import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '../../../design-system/atoms/Icon';
import { AppText } from '../../../design-system/atoms/Text';
import { AppStepIndicator } from '../../../design-system/molecules/StepIndicator';
import { useTheme } from '../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../design-system/theme/tokens';

export type CreateHeaderProps = {
  title: string;
  steps: string[];
  currentStep: number;
  onBack: () => void;
};

export function CreateHeader({
  title,
  steps,
  currentStep,
  onBack,
}: CreateHeaderProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.back}>
          <AppIcon name="back" size={24} />
        </Pressable>
        <AppText variant="subheading">{title}</AppText>
        <View style={styles.back} />
      </View>
      <AppStepIndicator steps={steps} currentStep={currentStep} />
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.sm,
      paddingBottom: theme.spacing.md,
      gap: theme.spacing.lg,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    back: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}
