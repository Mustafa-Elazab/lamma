import { useNavigation, type NavigationProp } from '@react-navigation/native';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { IconName } from '../../../../design-system/atoms/Icon';
import type { AppStackParamList } from '../../../../navigation/types';
import {
  groupNotifications,
  unreadCount,
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
  type NotificationType,
} from '../../core';

const TYPE_ICON: Record<NotificationType, IconName> = {
  invite: 'calendar',
  rsvp: 'user-check',
  update: 'comment',
  reminder: 'clock',
  comment: 'comment',
};

export function useNotificationsController() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp<AppStackParamList>>();
  const query = useNotifications();
  const markAll = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const notifications = useMemo(() => query.data ?? [], [query.data]);
  const sections = useMemo(
    () => groupNotifications(notifications),
    [notifications],
  );
  const unread = unreadCount(notifications);

  const iconFor = useCallback(
    (type: NotificationType): IconName => TYPE_ICON[type],
    [],
  );

  const onPressNotification = useCallback(
    (item: AppNotification) => {
      if (!item.read) {
        markRead.mutate(item.id);
      }
      if (item.eventId) {
        navigation.navigate('EventDetails', { eventId: item.eventId });
      }
    },
    [markRead, navigation],
  );

  const onMarkAllRead = useCallback(() => markAll.mutate(), [markAll]);

  return {
    t,
    sections,
    unread,
    iconFor,
    onPressNotification,
    onMarkAllRead,
    isLoading: query.isLoading,
    isError: query.isError,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
  };
}
