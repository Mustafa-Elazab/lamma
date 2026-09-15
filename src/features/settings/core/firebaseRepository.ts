import { getAuth } from '@react-native-firebase/auth';
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from '@react-native-firebase/firestore';

import { DEFAULT_PREFERENCES, type Preferences } from './entity';
import type { PreferencesRepository } from './repository';

function uid(): string {
  return getAuth().currentUser?.uid ?? 'anonymous';
}

function ref() {
  return doc(getFirestore(), 'users', uid(), 'meta', 'preferences');
}

export class FirebasePreferencesRepository implements PreferencesRepository {
  async get(): Promise<Preferences> {
    const snapshot = await getDoc(ref());
    if (!snapshot.exists()) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = (snapshot.data() ?? {}) as Partial<Preferences>;
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
      notifications: {
        ...DEFAULT_PREFERENCES.notifications,
        ...(parsed.notifications ?? {}),
      },
    };
  }

  async save(preferences: Preferences): Promise<void> {
    await setDoc(ref(), preferences);
  }
}
