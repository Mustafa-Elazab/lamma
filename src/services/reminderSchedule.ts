export type ReminderKind = 'day' | 'hour';

export type ReminderFireTime = {
  kind: ReminderKind;
  at: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

export function reminderNotificationId(
  eventId: string,
  kind: ReminderKind,
): string {
  return `lamma.event.${eventId}.${kind}`;
}

/** Day-before and hour-before fire times that are still in the future. */
export function reminderFireTimes(
  startAt: number,
  now = Date.now(),
): ReminderFireTime[] {
  if (!Number.isFinite(startAt) || startAt <= now) {
    return [];
  }
  return (
    [
      { kind: 'day', at: startAt - DAY_MS },
      { kind: 'hour', at: startAt - HOUR_MS },
    ] as const
  ).filter(item => item.at > now);
}

export function shouldRemindForRsvp(status: string, isHosting: boolean): boolean {
  return isHosting || status === 'going';
}
