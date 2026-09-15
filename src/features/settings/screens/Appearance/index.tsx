import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Icon, type IconName } from '../../../../design-system/atoms/Icon';
import { Text } from '../../../../design-system/atoms/Text';
import { ScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { ScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { usePreferences, type AppearanceMode } from '../../core';

export function AppearanceScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const options: { value: AppearanceMode; label: string; icon: IconName }[] = [
    { value: 'light', label: t('settings.light'), icon: 'sun' },
    { value: 'dark', label: t('settings.dark'), icon: 'sun' },
    { value: 'system', label: t('settings.system'), icon: 'settings' },
  ];

  return (
    <ScreenTemplate
      edges={['top']}
      header={
        <ScreenHeader
          title={t('settings.appearanceTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <Text variant="caption" color="textMuted">
        {t('settings.appearanceHint')}
      </Text>
      <View style={styles.group}>
        {options.map((option, index) => (
          <React.Fragment key={option.value}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <Pressable
              style={styles.row}
              onPress={() =>
                update({ ...preferences, appearance: option.value })
              }
            >
              <Icon name={option.icon} size={20} color="primary" />
              <Text variant="body" style={styles.rowLabel}>
                {option.label}
              </Text>
              {preferences.appearance === option.value ? (
                <Icon name="check" size={22} color="primary" />
              ) : null}
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </ScreenTemplate>
  );
}

function createStyles(theme: Theme) {
  return StyleSheet.create({
    group: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
      paddingVertical: theme.spacing.lg,
    },
    rowLabel: { flex: 1 },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
