import {
  getAnalytics,
  logEvent,
  logScreenView,
} from '@react-native-firebase/analytics';

import { appLogger } from './logger';

type AnalyticsEvent =
  | 'sign_in_method'
  | 'event_created'
  | 'event_published'
  | 'rsvp_submitted'
  | 'invite_shared';

type EventParameters = Record<string, string | number | boolean>;

export async function trackEvent(
  name: AnalyticsEvent,
  parameters: EventParameters = {},
): Promise<void> {
  try {
    await logEvent(getAnalytics(), name, parameters);
    appLogger.display(`analytics: ${name}`, parameters);
  } catch (error) {
    appLogger.error(`[analytics] Could not log ${name}`, error, parameters);
  }
}

export async function trackScreen(screenName: string): Promise<void> {
  try {
    await logScreenView(getAnalytics(), {
      screen_name: screenName,
      screen_class: screenName,
    });
    appLogger.display('analytics: screen_view', { screenName });
  } catch (error) {
    appLogger.error('[analytics] Could not log screen view', error, {
      screenName,
    });
  }
}
