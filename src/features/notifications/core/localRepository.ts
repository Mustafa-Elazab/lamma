import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AppNotification } from './entity';
import type { NotificationRepository } from './repository';
import { buildSeedNotifications } from './seed';

const READ_KEY = 'lamma.notifications.read';

async function readIds(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(READ_KEY);
  return new Set(raw ? (JSON.parse(raw) as string[]) : []);
}

async function writeIds(ids: Set<string>): Promise<void> {
  await AsyncStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

export class LocalNotificationRepository implements NotificationRepository {
  async list(): Promise<AppNotification[]> {
    const readIdsSet = await readIds();
    return buildSeedNotifications().map(n => ({
      ...n,
      read: n.read || readIdsSet.has(n.id),
    }));
  }

  async markRead(id: string): Promise<void> {
    const ids = await readIds();
    ids.add(id);
    await writeIds(ids);
  }

  async markAllRead(): Promise<void> {
    const ids = new Set(buildSeedNotifications().map(n => n.id));
    await writeIds(ids);
  }
}
