import { groupNotifications, unreadCount } from '../entity';
import { buildSeedNotifications } from '../seed';

describe('notification entity helpers', () => {
  const noon = new Date();
  noon.setHours(12, 0, 0, 0);
  const now = noon.getTime();
  const notifications = buildSeedNotifications(now);

  it('counts unread notifications', () => {
    expect(unreadCount(notifications)).toBe(2);
  });

  it('groups into today and earlier sections', () => {
    const sections = groupNotifications(notifications, now);
    const keys = sections.map(s => s.key);
    expect(keys).toContain('today');
    expect(keys).toContain('earlier');
    const today = sections.find(s => s.key === 'today');
    expect(today?.items.every(i => i.createdAt >= startOfDay(now))).toBe(true);
  });

  it('sorts items newest first within a section', () => {
    const sections = groupNotifications(notifications, now);
    const today = sections.find(s => s.key === 'today');
    const times = today?.items.map(i => i.createdAt) ?? [];
    const sorted = [...times].sort((a, b) => b - a);
    expect(times).toEqual(sorted);
  });
});

function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}
