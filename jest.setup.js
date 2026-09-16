/* eslint-disable no-undef */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: jest.fn(() => ({})),
  logEvent: jest.fn(() => Promise.resolve()),
  logScreenView: jest.fn(() => Promise.resolve()),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  log: jest.fn(),
  recordError: jest.fn(),
  setAttributes: jest.fn(() => Promise.resolve(null)),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
    EPHEMERAL: 3,
  },
  getMessaging: jest.fn(() => ({})),
  getInitialNotification: jest.fn(() => Promise.resolve(null)),
  getToken: jest.fn(() => Promise.resolve('test-fcm-token')),
  isDeviceRegisteredForRemoteMessages: jest.fn(() => true),
  onMessage: jest.fn(() => jest.fn()),
  onNotificationOpenedApp: jest.fn(() => jest.fn()),
  onTokenRefresh: jest.fn(() => jest.fn()),
  registerDeviceForRemoteMessages: jest.fn(() => Promise.resolve()),
  requestPermission: jest.fn(() => Promise.resolve(1)),
  setBackgroundMessageHandler: jest.fn(),
}));

jest.mock('@react-native-firebase/remote-config', () => ({
  getRemoteConfig: jest.fn(() => ({})),
  fetchAndActivate: jest.fn(() => Promise.resolve(false)),
}));
