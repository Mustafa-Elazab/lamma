export type NotificationType =
  | 'invite'
  | 'rsvp'
  | 'update'
  | 'reminder'
  | 'comment';

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  actorName: string | null;
  eventId: string | null;
  createdAt: number;
  read: boolean;
};

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter(n => !n.read).length;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export type NotificationSection = {
  key: 'today' | 'earlier';
  items: AppNotification[];
};

export function groupNotifications(
  notifications: AppNotification[],
  now = Date.now(),
): NotificationSection[] {
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const threshold = startOfToday.getTime();
  const sorted = [...notifications].sort((a, b) => b.createdAt - a.createdAt);
  const today = sorted.filter(n => n.createdAt >= threshold);
  const earlier = sorted.filter(n => n.createdAt < threshold);
  const sections: NotificationSection[] = [];
  if (today.length > 0) {
    sections.push({ key: 'today', items: today });
  }
  if (earlier.length > 0) {
    sections.push({ key: 'earlier', items: earlier });
  }
  return sections;
}

export const RECENT_WINDOW_MS = DAY_MS * 30;
