import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { AppNotification } from './entity';
import { getNotificationRepository } from './notificationRepository';
import { notificationKeys } from './queryKeys';

export function useNotifications() {
  const repository = getNotificationRepository();
  return useQuery<AppNotification[], Error>({
    queryKey: notificationKeys.list(),
    queryFn: () => repository.list(),
  });
}

export function useMarkNotificationRead() {
  const repository = getNotificationRepository();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: id => repository.markRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const repository = getNotificationRepository();
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () => repository.markAllRead(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
