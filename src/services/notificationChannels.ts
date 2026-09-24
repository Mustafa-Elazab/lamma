import notifee, { AndroidImportance } from '@notifee/react-native';
import { Platform } from 'react-native';

export const EVENT_START_CHANNEL_ID = 'event-start-alarm';

export async function ensureEventStartNotificationChannel(): Promise<string> {
  if (Platform.OS !== 'android') {
    return EVENT_START_CHANNEL_ID;
  }

  return notifee.createChannel({
    id: EVENT_START_CHANNEL_ID,
    name: 'Event start alerts',
    importance: AndroidImportance.HIGH,
    vibration: true,
    sound: 'default',
  });
}
