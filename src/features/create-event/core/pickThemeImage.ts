import { launchImageLibrary } from 'react-native-image-picker';

import { reportError } from '../../../services/crashReporting';

export async function pickThemeImage(): Promise<string | null> {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.9,
    });
    if (result.didCancel) {
      return null;
    }
    const uri = result.assets?.[0]?.uri;
    return uri ?? null;
  } catch (error) {
    reportError(error, 'create-event.pick-theme-image');
    throw error;
  }
}
