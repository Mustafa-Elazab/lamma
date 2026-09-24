import notifee, {
  AndroidImportance,
  TriggerType,
  type TimestampTrigger,
} from '@notifee/react-native';
import { i18n } from '../app/localization/i18n';
import { formatDateTime } from '../utils/format';
import type { LammaEvent } from '../features/events';
import { reportError } from './crashReporting';
import {
  reminderFireTimes,
  reminderNotificationId,
  shouldRemindForRsvp,
  type ReminderKind,
} from './reminderSchedule';

const CHANNEL_ID = 'event-reminders';

async function ensureChannel(): Promise<string> {
  return notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Event reminders',
    importance: AndroidImportance.HIGH,
  });
}

function copyFor(
  kind: ReminderKind,
  event: Pick<LammaEvent, 'title' | 'startAt' | 'venueName'>,
): { title: string; body: string } {
  const when = formatDateTime(
    event.startAt,
    i18n.language.startsWith('ar') ? 'ar' : 'en',
  );
  if (kind === 'day') {
    return {
      title: i18n.t('event.reminderDayTitle', { title: event.title }),
      body: i18n.t('event.reminderDayBody', {
        when,
        place: event.venueName,
      }),
    };
  }
  return {
    title: i18n.t('event.reminderHourTitle', { title: event.title }),
    body: i18n.t('event.reminderHourBody', { place: event.venueName }),
  };
}

export async function cancelEventReminders(eventId: string): Promise<void> {
  await Promise.all([
    notifee.cancelNotification(reminderNotificationId(eventId, 'day')),
    notifee.cancelNotification(reminderNotificationId(eventId, 'hour')),
  ]);
}

export async function cancelAllEventReminders(): Promise<void> {
  await notifee.cancelTriggerNotifications();
}

export async function syncEventReminders(
  event: Pick<
    LammaEvent,
    'id' | 'title' | 'startAt' | 'venueName' | 'viewerRsvp' | 'isHosting'
  >,
  enabled: boolean,
): Promise<void> {
  try {
    if (!enabled || !shouldRemindForRsvp(event.viewerRsvp, event.isHosting)) {
      await cancelEventReminders(event.id);
      return;
    }
    const settings = await notifee.requestPermission();
    if (settings.authorizationStatus < 1) {
      return;
    }
    const channelId = await ensureChannel();
    const fires = reminderFireTimes(event.startAt);
    if (fires.length === 0) {
      await cancelEventReminders(event.id);
      return;
    }
    await cancelEventReminders(event.id);
    await Promise.all(
      fires.map(async item => {
        const copy = copyFor(item.kind, event);
        const trigger: TimestampTrigger = {
          type: TriggerType.TIMESTAMP,
          timestamp: item.at,
          alarmManager: { allowWhileIdle: true },
        };
        await notifee.createTriggerNotification(
          {
            id: reminderNotificationId(event.id, item.kind),
            title: copy.title,
            body: copy.body,
            data: { eventId: event.id },
            android: {
              channelId,
              pressAction: { id: 'default' },
            },
          },
          trigger,
        );
      }),
    );
  } catch (error) {
    reportError(error, 'reminders.sync', { eventId: event.id });
  }
}

export async function syncUpcomingEventReminders(
  events: ReadonlyArray<
    Pick<
      LammaEvent,
      'id' | 'title' | 'startAt' | 'venueName' | 'viewerRsvp' | 'isHosting'
    >
  >,
  enabled: boolean,
): Promise<void> {
  if (!enabled) {
    await cancelAllEventReminders();
    return;
  }
  await Promise.all(events.map(event => syncEventReminders(event, true)));
}
