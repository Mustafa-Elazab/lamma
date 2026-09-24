import { Linking, NativeModules, Platform } from 'react-native';

export const WHATSAPP_ANDROID_PACKAGE = 'com.whatsapp';
export const ANDROID_PLAY_STORE_PACKAGE = 'com.android.vending';
export const WHATSAPP_PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${WHATSAPP_ANDROID_PACKAGE}`;
export const WHATSAPP_MARKET_URL = `market://details?id=${WHATSAPP_ANDROID_PACKAGE}`;
export const WHATSAPP_IOS_STORE_URL = 'itms-apps://itunes.apple.com/app/id310633997';
export const WHATSAPP_IOS_WEB_STORE_URL = 'https://apps.apple.com/app/id310633997';

type NativeIntentModule = {
  openUrlInPackage?: (url: string, packageName: string) => Promise<void>;
};

export function whatsappStoreUrls(os: typeof Platform.OS = Platform.OS): {
  primary: string;
  fallback: string;
} {
  if (os === 'ios') {
    return { primary: WHATSAPP_IOS_STORE_URL, fallback: WHATSAPP_IOS_WEB_STORE_URL };
  }
  return { primary: WHATSAPP_MARKET_URL, fallback: WHATSAPP_PLAY_STORE_URL };
}

export function asFileUrl(path: string): string {
  if (path.startsWith('file://') || path.startsWith('content://')) {
    return path;
  }
  return `file://${path}`;
}

export function isShareTargetMissing(error: unknown): boolean {
  if (error == null) {
    return false;
  }
  const parts: string[] = [];
  if (typeof error === 'string') {
    parts.push(error);
  }
  if (error instanceof Error) {
    parts.push(error.message, error.name);
  }
  if (typeof error === 'object') {
    const record = error as Record<string, unknown>;
    for (const key of ['message', 'error', 'code', 'errorCode']) {
      if (record[key] != null) {
        parts.push(String(record[key]));
      }
    }
  }
  const haystack = parts.join(' ').toLowerCase();
  return (
    haystack.includes('not installed') ||
    haystack.includes('notinstalled') ||
    haystack.includes('not_installed') ||
    haystack.includes('not available') ||
    haystack.includes('notavailable') ||
    haystack.includes('no activity') ||
    haystack.includes('activity not found') ||
    haystack.includes('application is not installed')
  );
}

export async function openStoreListing(urls: {
  primary: string;
  fallback: string;
}): Promise<void> {
  if (Platform.OS === 'android') {
    const nativeIntent = NativeModules.NativeIntent as NativeIntentModule | undefined;
    if (nativeIntent?.openUrlInPackage) {
      try {
        await nativeIntent.openUrlInPackage(urls.fallback, ANDROID_PLAY_STORE_PACKAGE);
        return;
      } catch {
        // Devices without Google Play Services still fall through to the web URL.
      }
    }
  }
  try {
    await Linking.openURL(urls.primary);
  } catch {
    await Linking.openURL(urls.fallback);
  }
}

export async function shareWhatsAppNative(params: {
  shareSingle: (options: {
    social: string;
    message: string;
    url: string;
    type: string;
  }) => Promise<unknown>;
  social: string;
  message: string;
  url: string;
  openStore: () => Promise<void>;
}): Promise<'shared' | 'store'> {
  try {
    await params.shareSingle({
      social: params.social,
      message: params.message,
      url: params.url,
      type: 'image/png',
    });
    return 'shared';
  } catch (error) {
    if (isShareTargetMissing(error)) {
      await params.openStore();
      return 'store';
    }
    throw error;
  }
}
