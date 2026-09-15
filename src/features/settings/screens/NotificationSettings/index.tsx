import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { AppText } from '../../../../design-system/atoms/Text';
import { AppToggle } from '../../../../design-system/atoms/Toggle';
import { AppScreenHeader } from '../../../../design-system/molecules/ScreenHeader';
import { AppScreenTemplate } from '../../../../design-system/templates/ScreenTemplate';
import { useTheme } from '../../../../design-system/theme/ThemeProvider';
import type { Theme } from '../../../../design-system/theme/tokens';
import { usePreferences, type NotificationPreferences } from '../../core';

export function NotificationSettingsScreen(): React.ReactElement {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const setKey = (key: keyof NotificationPreferences, value: boolean) => {
    update({
      ...preferences,
      notifications: { ...preferences.notifications, [key]: value },
    });
  };

  const items: {
    key: keyof NotificationPreferences;
    label: string;
    hint: string;
  }[] = [
    {
      key: 'reminders',
      label: t('settings.remindersLabel'),
      hint: t('settings.remindersHint'),
    },
    {
      key: 'rsvps',
      label: t('settings.rsvpsLabel'),
      hint: t('settings.rsvpsHint'),
    },
    {
      key: 'updates',
      label: t('settings.updatesLabel'),
      hint: t('settings.updatesHint'),
    },
    {
      key: 'invites',
      label: t('settings.invitesLabel'),
      hint: t('settings.invitesHint'),
    },
  ];

  return (
    <AppScreenTemplate
      edges={['top']}
      header={
        <AppScreenHeader
          title={t('settings.notificationsTitle')}
          onBack={() => navigation.goBack()}
        />
      }
    >
      <View style={styles.group}>
        {items.map((item, index) => (
          <React.Fragment key={item.key}>
            {index > 0 ? <View style={styles.divider} /> : null}
            <View style={styles.row}>
              <View style={styles.rowText}>
                <AppText variant="bodyStrong">{item.label}</AppText>
                <AppText variant="caption" color="textMuted">
                  {item.hint}
                </AppText>
              </View>
              <AppToggle
                value={preferences.notifications[item.key]}
                onValueChange={value => setKey(item.key, value)}
              />
            </View>
          </React.Fragment>
        ))}
      </View>
    </AppScreenTemplate>
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
      paddingVertical: theme.spacing.md,
    },
    rowText: { flex: 1, gap: 2 },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: theme.colors.border,
    },
  });
}
