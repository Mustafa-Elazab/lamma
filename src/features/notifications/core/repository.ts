import type { AppNotification } from './entity';

export interface NotificationRepository {
  list(): Promise<AppNotification[]>;
  markRead(id: string): Promise<void>;
  markAllRead(): Promise<void>;
}
