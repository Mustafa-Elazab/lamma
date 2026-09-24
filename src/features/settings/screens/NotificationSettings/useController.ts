import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import { usePreferences, type NotificationPreferences } from '../../core';
import {
  cancelAllEventReminders,
} from '../../../../services/eventReminders';

export function useNotificationSettingsController() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { preferences, update } = usePreferences();

  const setKey = (key: keyof NotificationPreferences, value: boolean) => {
    update({
      ...preferences,
      notifications: { ...preferences.notifications, [key]: value },
    });
    if (key === 'reminders' && !value) {
      void cancelAllEventReminders();
    }
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

  return {
    t,
    items,
    notifications: preferences.notifications,
    setKey,
    goBack: () => navigation.goBack(),
  };
}
