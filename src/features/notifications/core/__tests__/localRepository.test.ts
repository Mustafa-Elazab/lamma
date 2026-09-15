import AsyncStorage from '@react-native-async-storage/async-storage';

import { buildSeedNotifications } from '../../testFixtures';
import { unreadCount } from '../entity';
import {
  LocalNotificationRepository,
  __seedLocalNotifications,
} from '../localRepository';

describe('LocalNotificationRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('starts empty with no seeded notifications', async () => {
    const repo = new LocalNotificationRepository();
    const list = await repo.list();
    expect(list).toHaveLength(0);
  });

  it('lists seeded notifications newest first', async () => {
    await __seedLocalNotifications(buildSeedNotifications());
    const repo = new LocalNotificationRepository();
    const list = await repo.list();
    expect(list.length).toBeGreaterThan(0);
    const times = list.map(n => n.createdAt);
    expect(times).toEqual([...times].sort((a, b) => b - a));
  });

  it('marks a single notification as read', async () => {
    await __seedLocalNotifications(buildSeedNotifications());
    const repo = new LocalNotificationRepository();
    const before = await repo.list();
    const firstUnread = before.find(n => !n.read)!;
    await repo.markRead(firstUnread.id);
    const after = await repo.list();
    expect(after.find(n => n.id === firstUnread.id)?.read).toBe(true);
  });

  it('marks all notifications as read', async () => {
    await __seedLocalNotifications(buildSeedNotifications());
    const repo = new LocalNotificationRepository();
    await repo.markAllRead();
    const after = await repo.list();
    expect(unreadCount(after)).toBe(0);
  });
});
