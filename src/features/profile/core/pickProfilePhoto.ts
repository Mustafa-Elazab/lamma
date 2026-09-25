import { launchImageLibrary } from 'react-native-image-picker';

import { reportError } from '../../../services/crashReporting';

/**
 * Picks a profile photo shrunk to 512px / quality 0.6 and returns it as a
 * base64 data URI, stored inline on the user's Firestore profile (the free
 * Spark plan has no Firebase Storage), same approach as custom event covers.
 */
export async function pickProfilePhoto(): Promise<string | null> {
  try {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      maxWidth: 512,
      maxHeight: 512,
      quality: 0.6,
      includeBase64: true,
    });
    if (result.didCancel) {
      return null;
    }
    const asset = result.assets?.[0];
    if (!asset?.base64) {
      return null;
    }
    const type = asset.type?.startsWith('image/') ? asset.type : 'image/jpeg';
    return `data:${type};base64,${asset.base64}`;
  } catch (error) {
    reportError(error, 'profile.pick-photo');
    throw error;
  }
}
