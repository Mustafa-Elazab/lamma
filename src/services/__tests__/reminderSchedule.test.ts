import {
  reminderFireTimes,
  reminderNotificationId,
  shouldRemindForRsvp,
} from '../reminderSchedule';

describe('event reminder schedule', () => {
  it('schedules day-before and hour-before when both are in the future', () => {
    const now = Date.parse('2026-09-19T12:00:00.000Z');
    const startAt = now + 48 * 60 * 60 * 1000;
    expect(reminderFireTimes(startAt, now)).toEqual([
      { kind: 'day', at: startAt - 24 * 60 * 60 * 1000 },
      { kind: 'hour', at: startAt - 60 * 60 * 1000 },
    ]);
  });

  it('skips the day reminder when the event is sooner than 24 hours', () => {
    const now = Date.parse('2026-09-19T12:00:00.000Z');
    const startAt = now + 5 * 60 * 60 * 1000;
    expect(reminderFireTimes(startAt, now)).toEqual([
      { kind: 'hour', at: startAt - 60 * 60 * 1000 },
    ]);
  });

  it('schedules nothing for past events', () => {
    const now = Date.parse('2026-09-19T12:00:00.000Z');
    expect(reminderFireTimes(now - 1000, now)).toEqual([]);
  });

  it('builds stable notification ids', () => {
    expect(reminderNotificationId('abc', 'day')).toBe('lamma.event.abc.day');
  });

  it('reminds hosts and going guests only', () => {
    expect(shouldRemindForRsvp('going', false)).toBe(true);
    expect(shouldRemindForRsvp('declined', true)).toBe(true);
    expect(shouldRemindForRsvp('declined', false)).toBe(false);
    expect(shouldRemindForRsvp('maybe', false)).toBe(false);
  });
});
