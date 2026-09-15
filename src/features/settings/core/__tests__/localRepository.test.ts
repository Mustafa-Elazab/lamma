import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_PREFERENCES } from '../entity';
import { LocalPreferencesRepository } from '../localRepository';

describe('LocalPreferencesRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('returns defaults when nothing is saved', async () => {
    const repo = new LocalPreferencesRepository();
    expect(await repo.get()).toEqual(DEFAULT_PREFERENCES);
  });

  it('persists and merges saved preferences', async () => {
    const repo = new LocalPreferencesRepository();
    await repo.save({
      ...DEFAULT_PREFERENCES,
      appearance: 'dark',
      notifications: { ...DEFAULT_PREFERENCES.notifications, reminders: false },
    });
    const restored = await repo.get();
    expect(restored.appearance).toBe('dark');
    expect(restored.notifications.reminders).toBe(false);
    expect(restored.notifications.rsvps).toBe(true);
  });
});
