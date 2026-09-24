import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAuth } from '@react-native-firebase/auth';
import {
  deleteDoc,
  doc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';
import {
  EventType,
  default as notifee,
  type Event as NotifeeEvent,
} from '@notifee/react-native';
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
import { PermissionsAndroid, Platform } from 'react-native';

import { buildEventAppLink } from '../navigation/linking';
import { reportError } from './crashReporting';
import { appLogger } from './logger';
import { ensureEventStartNotificationChannel } from './notificationChannels';

const TOKEN_STORAGE_KEY = '@lamma/messaging/fcm-token';
const BACKGROUND_MESSAGE_KEY = '@lamma/messaging/last-background-message';
type NotificationOpenHandler = (link: string) => void | Promise<void>;
let notificationOpenHandler: NotificationOpenHandler | null = null;
let pendingNotificationLink: string | null = null;

function isEventStartMessage(message: RemoteMessage): boolean {
  return message.data?.type === 'event_start';
}

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
  return eventId ? buildEventAppLink(eventId) : null;
}

function tokenDocument(uid: string, token: string) {
  return doc(
    getFirestore(),
    'users',
    uid,
    'devices',
    encodeURIComponent(token),
  );
}

async function syncTokenForCurrentUser(token: string): Promise<boolean> {
  const uid = getAuth().currentUser?.uid;
  if (!uid) {
    return false;
  }
  await setDoc(tokenDocument(uid, token), {
    token,
    platform: Platform.OS,
    updatedAt: Date.now(),
  });
  return true;
}

async function storeToken(token: string): Promise<void> {
  const previousToken = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const uid = getAuth().currentUser?.uid;
  if (uid && previousToken && previousToken !== token) {
    await deleteDoc(tokenDocument(uid, previousToken));
  }
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  const synced = await syncTokenForCurrentUser(token);
  appLogger.log('[messaging] FCM token stored', {
    syncedToUser: synced,
  });
}

export async function syncStoredMessagingToken(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  if (token) {
    await syncTokenForCurrentUser(token);
  }
}

export async function detachStoredMessagingToken(): Promise<void> {
  const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  const uid = getAuth().currentUser?.uid;
  if (token && uid) {
    await deleteDoc(tokenDocument(uid, token));
  }
}

export function setNotificationOpenHandler(
  handler: NotificationOpenHandler,
): () => void {
  notificationOpenHandler = handler;
  const pendingLink = pendingNotificationLink;
  pendingNotificationLink = null;
  if (pendingLink) {
    Promise.resolve(handler(pendingLink)).catch(error => {
      reportError(error, 'messaging.open-pending-notification');
    });
  }
  return () => {
    if (notificationOpenHandler === handler) {
      notificationOpenHandler = null;
    }
  };
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
  if (notificationOpenHandler) {
    await notificationOpenHandler(link);
  } else {
    pendingNotificationLink = link;
    appLogger.log('[messaging] Event navigation queued until app is ready');
  }
}

async function openNotifeeEvent(event: NotifeeEvent): Promise<void> {
  if (event.type !== EventType.PRESS) {
    return;
  }
  const value = event.detail.notification?.data?.eventId;
  const eventId = typeof value === 'string' ? value : null;
  if (!eventId) {
    return;
  }
  const link = buildEventAppLink(eventId);
  if (notificationOpenHandler) {
    await notificationOpenHandler(link);
  } else {
    pendingNotificationLink = link;
  }
}

async function displayForegroundStartNotification(
  message: RemoteMessage,
): Promise<void> {
  const eventId = eventIdFromMessage(message);
  if (!eventId) {
    return;
  }
  const channelId = await ensureEventStartNotificationChannel();
  await notifee.displayNotification({
    title:
      message.notification?.title ??
      (typeof message.data?.title === 'string'
        ? message.data.title
        : 'Your event is starting now'),
    body:
      message.notification?.body ??
      (typeof message.data?.body === 'string' ? message.data.body : undefined),
    data: { eventId },
    android: {
      channelId,
      pressAction: { id: 'default' },
    },
  });
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
      await ensureEventStartNotificationChannel();
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
    if (isEventStartMessage(message)) {
      void displayForegroundStartNotification(message).catch(error => {
        reportError(error, 'messaging.display-start-notification', {
          messageId: message.messageId,
        });
      });
    }
  });
  const unsubscribeNotifeeForeground = notifee.onForegroundEvent(event => {
    void openNotifeeEvent(event).catch(error => {
      reportError(error, 'messaging.open-foreground-notification');
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
    unsubscribeNotifeeForeground();
    unsubscribeOpened();
    unsubscribeToken();
  };
}
