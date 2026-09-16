import {
  fetchAndActivate,
  getRemoteConfig,
} from '@react-native-firebase/remote-config';

import { reportError } from './crashReporting';
import { appLogger } from './logger';

export const remoteConfigDefaults = {
  event_discovery_enabled: true,
  messaging_enabled: true,
  max_event_guest_count: 250,
} as const;

export async function initializeRemoteConfig(): Promise<void> {
  const remoteConfig = getRemoteConfig();
  remoteConfig.defaultConfig = remoteConfigDefaults;
  remoteConfig.settings = {
    fetchTimeoutMillis: 10_000,
    minimumFetchIntervalMillis: __DEV__ ? 0 : 60 * 60 * 1000,
  };

  try {
    const activated = await fetchAndActivate(remoteConfig);
    appLogger.log('[remote-config] Fetch complete', { activated });
  } catch (error) {
    reportError(error, 'remote-config.fetch');
  }
}
