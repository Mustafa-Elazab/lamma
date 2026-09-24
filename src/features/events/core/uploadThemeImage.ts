import { getAuth } from '@react-native-firebase/auth';
import {
  getDownloadURL,
  getStorage,
  putFile,
  ref,
} from '@react-native-firebase/storage';

import { appLogger } from '../../../services/logger';

function localPath(uri: string): string {
  if (uri.startsWith('content://')) {
    return uri;
  }
  return uri.startsWith('file://') ? uri.replace('file://', '') : uri;
}

export function eventThemeStoragePath(uid: string, timestamp = Date.now()): string {
  return `events/${uid}/themes/${timestamp}.jpg`;
}

export async function uploadEventThemeImage(
  uid: string,
  localUri: string,
): Promise<string> {
  const user = getAuth().currentUser;
  if (!user) {
    throw new Error('storage/auth-required: sign in before uploading a cover');
  }
  if (user.uid !== uid) {
    throw new Error(
      'storage/auth-mismatch: signed-in user does not match upload path',
    );
  }

  const token = await user.getIdToken(true);
  if (!token) {
    throw new Error('storage/invalid-token: Firebase ID token is not valid');
  }

  const storage = getStorage();
  const objectPath = eventThemeStoragePath(uid);
  const objectRef = ref(storage, objectPath);
  appLogger.log('[events.theme-upload] Storage putFile', {
    path: objectPath,
    uid,
    isAnonymous: user.isAnonymous,
  });
  await putFile(objectRef, localPath(localUri), { contentType: 'image/jpeg' });
  return getDownloadURL(objectRef);
}
