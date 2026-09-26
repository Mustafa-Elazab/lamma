/**
 * The only place the app talks to Firebase Crashlytics. Everything else calls
 * reportError / crashBreadcrumb / setCrashIdentity from here.
 *
 * Collection is OFF in __DEV__ builds unless `env.crashlyticsInDev` is true
 * (firebase.json sets `crashlytics_debug_enabled: true` so that flag can turn
 * it on natively for testing). Release builds always collect.
 */
import {
  getCrashlytics,
  log,
  recordError,
  setAttributes,
  setCrashlyticsCollectionEnabled,
  setUserId,
} from '@react-native-firebase/crashlytics';

import { env } from '../config/env';
import { appLogger } from './logger';

type CrashContext = Record<string, string | number | boolean | null | undefined>;

/** Crashlytics attribute values are capped at 1 KB. */
const MAX_ATTRIBUTE_LENGTH = 1000;

export function crashCollectionEnabled(): boolean {
  return !__DEV__ || env.crashlyticsInDev;
}

export function normalizeError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error) {
    const wrapped = new Error(String((error as { message: unknown }).message));
    const stack = (error as { stack?: unknown }).stack;
    if (typeof stack === 'string') {
      wrapped.stack = stack;
    }
    return wrapped;
  }
  return new Error(error === undefined ? 'undefined' : String(error));
}

export function stringAttributes(context: CrashContext): Record<string, string> {
  const out: Record<string, string> = {};
  Object.keys(context).forEach(key => {
    const value = context[key];
    if (value === undefined) {
      return;
    }
    const text = String(value);
    out[key] =
      text.length > MAX_ATTRIBUTE_LENGTH
        ? text.slice(0, MAX_ATTRIBUTE_LENGTH)
        : text;
  });
  return out;
}

function withCrashlytics(
  label: string,
  action: (crashlytics: ReturnType<typeof getCrashlytics>) => unknown,
): void {
  try {
    const result = action(getCrashlytics());
    if (result && typeof (result as Promise<unknown>).catch === 'function') {
      (result as Promise<unknown>).catch(error =>
        appLogger.error(`[crashlytics] ${label} failed`, error),
      );
    }
  } catch (error) {
    appLogger.error(`[crashlytics] ${label} unavailable`, error);
  }
}

/** Records a non-fatal error with a source tag and string attributes. */
export function reportError(
  error: unknown,
  source: string,
  context: CrashContext = {},
): void {
  const normalized = normalizeError(error);
  appLogger.error(`[${source}] ${normalized.message}`, normalized, context);

  withCrashlytics('recordError', crashlytics => {
    log(crashlytics, `${source}: ${normalized.message}`);
    const attributes = stringAttributes({ source, ...context });
    void setAttributes(crashlytics, attributes).catch(attributeError =>
      appLogger.error('[crashlytics] Could not set error attributes', attributeError),
    );
    recordError(crashlytics, normalized, source);
  });
}

/** Breadcrumb that shows up in the "Logs" tab of the next Crashlytics report. */
export function crashBreadcrumb(message: string): void {
  withCrashlytics('log', crashlytics => log(crashlytics, message));
}

export type CrashIdentity = {
  userId: string | null;
  accountType: 'guest' | 'signed_in' | 'signed_out';
  language: string;
};

export function setCrashIdentity(identity: CrashIdentity): void {
  withCrashlytics('setUserId', crashlytics =>
    setUserId(crashlytics, identity.userId ?? ''),
  );
  withCrashlytics('setAttributes', crashlytics =>
    setAttributes(crashlytics, {
      account_type: identity.accountType,
      language: identity.language,
    }),
  );
}

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;
type ErrorUtilsLike = {
  getGlobalHandler: () => GlobalHandler;
  setGlobalHandler: (handler: GlobalHandler) => void;
};
type RejectionTracker = (options: {
  allRejections: boolean;
  onUnhandled: (id: number, rejection: unknown) => void;
  onHandled?: (id: number) => void;
}) => void;

let installed = false;

/** Global JS handler: records the error, then calls the previous handler (LogBox / RN crash). */
export function createGlobalErrorHandler(previous: GlobalHandler | undefined): GlobalHandler {
  return (error, isFatal) => {
    try {
      reportError(error, isFatal ? 'js.fatal' : 'js.global-handler', {
        fatal: Boolean(isFatal),
      });
    } catch {
      // never let reporting break the app's own error handling
    }
    previous?.(error, isFatal);
  };
}

export function onUnhandledRejection(_id: number, rejection: unknown): void {
  reportError(rejection, 'js.unhandled-rejection', { fatal: false });
}

/**
 * Enables/disables collection and installs the global handlers. Idempotent;
 * call once at startup (App.tsx).
 */
export function initializeCrashReporting(): void {
  if (installed) {
    return;
  }
  installed = true;
  const enabled = crashCollectionEnabled();
  withCrashlytics('setCrashlyticsCollectionEnabled', crashlytics =>
    setCrashlyticsCollectionEnabled(crashlytics, enabled),
  );

  const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsLike }).ErrorUtils;
  if (errorUtils) {
    errorUtils.setGlobalHandler(
      createGlobalErrorHandler(errorUtils.getGlobalHandler()),
    );
  }

  // Hermes' native Promise: RN only tracks rejections in __DEV__ (for LogBox),
  // so install our tracker in release, or in dev when collection is forced on.
  const tracker = (
    globalThis as {
      HermesInternal?: { enablePromiseRejectionTracker?: RejectionTracker };
    }
  ).HermesInternal?.enablePromiseRejectionTracker;
  if (tracker && (!__DEV__ || enabled)) {
    tracker({
      allRejections: true,
      onUnhandled: (id, rejection) => {
        if (__DEV__) {
          console.warn(`Possible unhandled promise rejection (id: ${id})`, rejection);
        }
        onUnhandledRejection(id, rejection);
      },
    });
  }
  crashBreadcrumb(`crash reporting initialized (collection ${enabled ? 'on' : 'off'})`);
}
