import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';

import {
  MAX_PROFILE_PHOTO_CHARS,
  normalizeProfile,
  type UserProfile,
  type UserProfilePatch,
} from './entity';
import type { UserProfileRepository } from './repository';

/** Profile lives on `users/{uid}` (rules: only the owner reads/writes it). */
export class FirebaseUserProfileRepository implements UserProfileRepository {
  async get(uid: string): Promise<UserProfile> {
    const snapshot = await getDoc(doc(getFirestore(), 'users', uid));
    return normalizeProfile(snapshot.exists() ? snapshot.data() : null);
  }

  async save(uid: string, patch: UserProfilePatch): Promise<UserProfile> {
    if (
      patch.photoDataUrl &&
      patch.photoDataUrl.length > MAX_PROFILE_PHOTO_CHARS
    ) {
      throw new Error('profile/photo-too-large: pick a smaller photo');
    }
    const payload: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(patch)) {
      if (value !== undefined) {
        payload[key] = value;
      }
    }
    await setDoc(doc(getFirestore(), 'users', uid), payload, { merge: true });
    return this.get(uid);
  }
}
