import { launchImageLibrary } from 'react-native-image-picker';

import { reportError } from '../../../services/crashReporting';

export async function pickThemeImage(): Promise<string | null> {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      // Covers are stored inside the event document (no Firebase Storage on
      // the free plan), so shrink and compress them to stay well under the
      // 1 MB Firestore document limit.
      maxWidth: 1000,
      maxHeight: 1000,
      quality: 0.6,
      includeBase64: true,
    });
    if (result.didCancel) {
      return null;
    }
    const asset = result.assets?.[0];
    if (asset?.base64) {
      const type = asset.type?.startsWith('image/') ? asset.type : 'image/jpeg';
      return `data:${type};base64,${asset.base64}`;
    }
    return asset?.uri ?? null;
  } catch (error) {
    reportError(error, 'create-event.pick-theme-image');
    throw error;
  }
}
