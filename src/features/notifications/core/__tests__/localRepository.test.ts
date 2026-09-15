import AsyncStorage from '@react-native-async-storage/async-storage';

import { unreadCount } from '../entity';
import { LocalNotificationRepository } from '../localRepository';

describe('LocalNotificationRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('lists seeded notifications', async () => {
    const repo = new LocalNotificationRepository();
    const list = await repo.list();
    expect(list.length).toBeGreaterThan(0);
  });

  it('marks a single notification as read', async () => {
    const repo = new LocalNotificationRepository();
    const before = await repo.list();
    const firstUnread = before.find(n => !n.read)!;
    await repo.markRead(firstUnread.id);
    const after = await repo.list();
    expect(after.find(n => n.id === firstUnread.id)?.read).toBe(true);
  });

  it('marks all notifications as read', async () => {
    const repo = new LocalNotificationRepository();
    await repo.markAllRead();
    const after = await repo.list();
    expect(unreadCount(after)).toBe(0);
  });
});
