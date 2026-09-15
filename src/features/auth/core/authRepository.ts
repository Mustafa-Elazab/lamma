import { env } from '../../../config/env';
import { LocalAuthRepository } from './localRepository';
import type { AuthRepository } from './repository';

let instance: AuthRepository | null = null;

/**
 * Returns the process-wide auth repository. Firebase is loaded lazily and only
 * when explicitly enabled, so development/CI never require native config.
 */
export function getAuthRepository(): AuthRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebaseAuthRepository,
    } = require('./firebaseRepository') as typeof import('./firebaseRepository');
    instance = new FirebaseAuthRepository({
      googleWebClientId: env.googleWebClientId,
    });
  } else {
    instance = new LocalAuthRepository();
  }
  return instance;
}

/** Test helper to reset the memoized repository. */
export function __resetAuthRepository(): void {
  instance = null;
}
