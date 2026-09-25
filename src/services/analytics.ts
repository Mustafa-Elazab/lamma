/**
 * The only place the app talks to Firebase Analytics. Screens and hooks call
 * the typed helpers below; nothing else imports @react-native-firebase/analytics.
 *
 * Debug on a device: `adb shell setprop debug.firebase.analytics.app com.getlamma.app`
 * then watch Firebase console > Analytics > DebugView (or `adb logcat -s FA FA-SVC`).
 */
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
} from '@react-native-firebase/analytics';

import { appLogger } from './logger';

export type SignInMethodParam = 'google' | 'apple' | 'guest';
export type ShareMethodParam = 'whatsapp' | 'share' | 'copy';

/** Every custom/recommended event the app logs, with its parameters. */
export type AnalyticsEvents = {
  login: { method: SignInMethodParam };
  sign_up: { method: SignInMethodParam };
  profile_setup_complete: { has_name: boolean; has_photo: boolean; skipped: boolean };
  event_create: { event_id: string; visibility: string };
  event_share: { event_id: string; method: ShareMethodParam };
  rsvp: { event_id: string; status: string };
  game_start: { game_id: string; pack_id?: string; players: number };
  game_end: { game_id: string; pack_id?: string; players: number };
  join_room: { game_id: string; source: 'link' | 'code' };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

type RawParams = Record<string, string | number>;

/** Analytics params must be strings/numbers; drop undefined and map booleans to 0/1. */
export function toAnalyticsParams(
  params: Record<string, string | number | boolean | null | undefined>,
): RawParams {
  const out: RawParams = {};
  Object.keys(params).forEach(key => {
    const value = params[key];
    if (value === undefined || value === null) {
      return;
    }
    out[key] = typeof value === 'boolean' ? (value ? 1 : 0) : value;
  });
  return out;
}

async function send(name: string, params: RawParams): Promise<void> {
  try {
    await (
      logEvent as unknown as (
        analytics: ReturnType<typeof getAnalytics>,
        eventName: string,
        eventParams?: RawParams,
      ) => Promise<void>
    )(getAnalytics(), name, params);
    appLogger.display(`analytics: ${name}`, params);
  } catch (error) {
    appLogger.error(`[analytics] Could not log ${name}`, error, params);
  }
}

export function trackEvent<N extends AnalyticsEventName>(
  name: N,
  parameters: AnalyticsEvents[N],
): Promise<void> {
  return send(name, toAnalyticsParams(parameters));
}

/** screen_view for React Navigation route changes (see RootNavigator). */
export function trackScreen(screenName: string): Promise<void> {
  return send('screen_view', {
    screen_name: screenName,
    screen_class: screenName,
  });
}

export type AnalyticsIdentity = {
  userId: string | null;
  accountType: 'guest' | 'signed_in' | 'signed_out';
  language: string;
};

/** Sets the Firebase uid and user properties; called on every auth/language change. */
export async function setAnalyticsIdentity(
  identity: AnalyticsIdentity,
): Promise<void> {
  try {
    const analytics = getAnalytics();
    await setUserId(analytics, identity.userId);
    await setUserProperties(analytics, {
      account_type: identity.accountType,
      app_language: identity.language,
    });
    appLogger.display('analytics: identity', identity);
  } catch (error) {
    appLogger.error('[analytics] Could not set user identity', error);
  }
}
