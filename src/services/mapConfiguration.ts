import { NativeModules, Platform } from 'react-native';

type NativeMapConfig = {
  isGoogleMapsConfigured?: boolean;
};

type NativeSettings = {
  settings?: {
    GOOGLE_MAPS_API_KEY?: string;
  };
};

export function isGoogleMapsConfigured(): boolean {
  if (Platform.OS === 'android') {
    return (
      (NativeModules.MapConfig as NativeMapConfig | undefined)
        ?.isGoogleMapsConfigured === true
    );
  }

  if (Platform.OS === 'ios') {
    const key = (NativeModules.SettingsManager as NativeSettings | undefined)
      ?.settings?.GOOGLE_MAPS_API_KEY;
    return Boolean(key && key.trim() && !key.startsWith('$('));
  }

  return false;
}
