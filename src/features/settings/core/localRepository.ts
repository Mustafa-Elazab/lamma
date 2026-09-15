import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PREFERENCES, type Preferences } from './entity';
import type { PreferencesRepository } from './repository';

const STORAGE_KEY = 'lamma.preferences';

export class LocalPreferencesRepository implements PreferencesRepository {
  async get(): Promise<Preferences> {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_PREFERENCES;
    }
    const parsed = JSON.parse(raw) as Partial<Preferences>;
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
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }
}
