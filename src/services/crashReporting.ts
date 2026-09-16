import {
  getCrashlytics,
  log,
  recordError,
  setAttributes,
} from '@react-native-firebase/crashlytics';

import { appLogger } from './logger';

type CrashContext = Record<string, string | number | boolean | null | undefined>;

function normalizeError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function stringAttributes(context: CrashContext): Record<string, string> {
  return Object.fromEntries(
    Object.entries(context)
      .filter((entry): entry is [string, string | number | boolean | null] =>
        entry[1] !== undefined,
      )
      .map(([key, value]) => [key, String(value)]),
  );
}

export function reportError(
  error: unknown,
  source: string,
  context: CrashContext = {},
): void {
  const normalized = normalizeError(error);
  appLogger.error(`[${source}] ${normalized.message}`, normalized, context);

  try {
    const crashlytics = getCrashlytics();
    log(crashlytics, `${source}: ${normalized.message}`);
    const attributes = stringAttributes({ source, ...context });
    if (Object.keys(attributes).length > 0) {
      void setAttributes(crashlytics, attributes).catch(attributeError => {
        appLogger.error(
          '[crashlytics] Could not set error attributes',
          attributeError,
        );
      });
    }
    recordError(crashlytics, normalized, source);
  } catch (crashlyticsError) {
    appLogger.error(
      '[crashlytics] Native crash reporting unavailable',
      crashlyticsError,
    );
  }
}
