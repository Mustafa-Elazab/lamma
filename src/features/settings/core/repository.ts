import type { Preferences } from './entity';

export interface PreferencesRepository {
  get(): Promise<Preferences>;
  save(preferences: Preferences): Promise<void>;
}
