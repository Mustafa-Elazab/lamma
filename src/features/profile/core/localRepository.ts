import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  normalizeProfile,
  type UserProfile,
  type UserProfilePatch,
} from './entity';
import type { UserProfileRepository } from './repository';

const key = (uid: string) => `lamma.profile.${uid}`;

/** AsyncStorage-backed profile used when Firebase is disabled (dev / tests). */
export class LocalUserProfileRepository implements UserProfileRepository {
  async get(uid: string): Promise<UserProfile> {
    const raw = await AsyncStorage.getItem(key(uid));
    return normalizeProfile(raw ? JSON.parse(raw) : null);
  }

  async save(uid: string, patch: UserProfilePatch): Promise<UserProfile> {
    const current = await this.get(uid);
    const next: UserProfile = {
      ...current,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ),
      updatedAt: Date.now(),
    };
    await AsyncStorage.setItem(key(uid), JSON.stringify(next));
    return next;
  }
}
