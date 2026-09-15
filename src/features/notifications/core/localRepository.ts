import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppNotification } from './entity';
import type { NotificationRepository } from './repository';

const STORAGE_KEY = 'lamma.notifications.items';

async function read(): Promise<AppNotification[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AppNotification[]) : [];
}

async function write(items: AppNotification[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

/**
 * `__DEV__`-only notification repository. Starts empty (no seeded notifications)
 * and is only used when `env.firebaseEnabled` is false. Production reads real
 * notifications from Firestore.
 */
export class LocalNotificationRepository implements NotificationRepository {
  async list(): Promise<AppNotification[]> {
    const items = await read();
    return items.sort((a, b) => b.createdAt - a.createdAt);
  }

  async markRead(id: string): Promise<void> {
    const items = await read();
    await write(items.map(n => (n.id === id ? { ...n, read: true } : n)));
  }

  async markAllRead(): Promise<void> {
    const items = await read();
    await write(items.map(n => ({ ...n, read: true })));
  }
}

/** Test/dev helper to seed the local notification store with fixtures. */
export async function __seedLocalNotifications(
  items: AppNotification[],
): Promise<void> {
  await write(items);
}
