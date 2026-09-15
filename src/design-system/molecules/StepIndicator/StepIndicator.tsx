import React, { Fragment, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../../theme/ThemeProvider';
import type { Theme } from '../../theme/tokens';
import { Icon } from '../../atoms/Icon';
import { Text } from '../../atoms/Text';

export type StepIndicatorProps = {
  steps: string[];
  /** Zero-based index of the active step. */
  currentStep: number;
};

export function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        const circleStyle = [
          styles.circle,
          (isActive || isDone) && styles.circleActive,
        ];
        return (
          <Fragment key={step}>
            {index > 0 ? (
              <View
                style={[styles.line, isDone && styles.lineActive]}
              />
            ) : null}
            <View style={styles.stepItem}>
              <View style={circleStyle}>
                {isDone ? (
                  <Icon name="check" size={16} color="textInverse" />
                ) : (
                  <Text
                    variant="label"
                    color={isActive ? 'textInverse' : 'textMuted'}
                  >
                    {String(index + 1)}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                color={isActive || isDone ? 'primary' : 'textMuted'}
                weight={isActive ? '700' : '500'}
                style={styles.label}
              >
                {step}
              </Text>
            </View>
          </Fragment>
        );
      })}
    </View>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    stepItem: { alignItems: 'center', gap: theme.spacing.xs, width: 64 },
    circle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
    },
    circleActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    label: { textAlign: 'center' },
    line: {
      flex: 1,
      height: 1.5,
      backgroundColor: theme.colors.border,
      marginTop: 16,
    },
    lineActive: { backgroundColor: theme.colors.primary },
  });
}
