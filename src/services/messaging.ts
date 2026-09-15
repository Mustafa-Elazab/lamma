import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthorizationStatus,
  getInitialNotification,
  getMessaging,
  getToken,
  isDeviceRegisteredForRemoteMessages,
  onMessage,
  onNotificationOpenedApp,
  onTokenRefresh,
  registerDeviceForRemoteMessages,
  requestPermission,
  setBackgroundMessageHandler,
  type RemoteMessage,
} from '@react-native-firebase/messaging';
import { Linking, PermissionsAndroid, Platform } from 'react-native';

import { buildEventDeepLink } from '../navigation/linking';
import { reportError } from './crashReporting';
import { appLogger } from './logger';

const TOKEN_STORAGE_KEY = '@lamma/messaging/fcm-token';
const BACKGROUND_MESSAGE_KEY = '@lamma/messaging/last-background-message';

function eventIdFromMessage(
  message: RemoteMessage,
): string | null {
  const value = message.data?.eventId ?? message.data?.event_id;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

export function eventLinkFromMessage(
  message: RemoteMessage,
): string | null {
  const eventId = eventIdFromMessage(message);
  return eventId ? buildEventDeepLink(eventId) : null;
}

async function storeToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  appLogger.log('[messaging] FCM token stored', {
    tokenSuffix: token.slice(-6),
  });
}

async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    if (Number(Platform.Version) < 33) {
      return true;
    }
    const result = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }

  const status = await requestPermission(getMessaging());
  return (
    status === AuthorizationStatus.AUTHORIZED ||
    status === AuthorizationStatus.PROVISIONAL ||
    status === AuthorizationStatus.EPHEMERAL
  );
}

async function openMessageEvent(
  message: RemoteMessage,
): Promise<void> {
  const link = eventLinkFromMessage(message);
  if (!link) {
    appLogger.log('[messaging] Notification tap had no event id', {
      messageId: message.messageId,
    });
    return;
  }
  appLogger.display('messaging: open event', {
    messageId: message.messageId,
    link,
  });
  await Linking.openURL(link);
}

export function registerBackgroundMessagingHandler(): void {
  setBackgroundMessageHandler(getMessaging(), async message => {
    appLogger.log('[messaging] Background message received', {
      messageId: message.messageId,
      eventId: eventIdFromMessage(message),
    });
    await AsyncStorage.setItem(
      BACKGROUND_MESSAGE_KEY,
      JSON.stringify({
        messageId: message.messageId ?? null,
        eventId: eventIdFromMessage(message),
        receivedAt: Date.now(),
      }),
    );
  });
}

export async function initializeMessaging(): Promise<() => void> {
  const messaging = getMessaging();
  try {
    const granted = await requestNotificationPermission();
    if (!granted) {
      appLogger.log('[messaging] Notification permission not granted');
    } else {
      if (
        Platform.OS === 'ios' &&
        !isDeviceRegisteredForRemoteMessages(messaging)
      ) {
        await registerDeviceForRemoteMessages(messaging);
      }
      await storeToken(await getToken(messaging));
    }
  } catch (error) {
    reportError(error, 'messaging.initialize');
  }

  const unsubscribeForeground = onMessage(messaging, message => {
    appLogger.display('messaging: foreground notification', {
      messageId: message.messageId,
      title: message.notification?.title,
      eventId: eventIdFromMessage(message),
    });
  });
  const unsubscribeOpened = onNotificationOpenedApp(messaging, message => {
    void openMessageEvent(message).catch(error => {
      reportError(error, 'messaging.open-notification', {
        messageId: message.messageId,
      });
    });
  });
  const unsubscribeToken = onTokenRefresh(messaging, token => {
    void storeToken(token).catch(error => {
      reportError(error, 'messaging.store-token');
    });
  });

  void getInitialNotification(messaging)
    .then(message => (message ? openMessageEvent(message) : undefined))
    .catch(error => {
      reportError(error, 'messaging.initial-notification');
    });

  return () => {
    unsubscribeForeground();
    unsubscribeOpened();
    unsubscribeToken();
  };
}
