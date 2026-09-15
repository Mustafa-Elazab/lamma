import { env } from '../../../config/env';
import { LocalPreferencesRepository } from './localRepository';
import type { PreferencesRepository } from './repository';

let instance: PreferencesRepository | null = null;

export function getPreferencesRepository(): PreferencesRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebasePreferencesRepository,
    } = require('./firebaseRepository') as typeof import('./firebaseRepository');
    instance = new FirebasePreferencesRepository();
  } else {
    instance = new LocalPreferencesRepository();
  }
  return instance;
}

export function __resetPreferencesRepository(): void {
  instance = null;
}
