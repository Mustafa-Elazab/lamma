import { env } from '../../../config/env';
import { LocalUserProfileRepository } from './localRepository';
import type { UserProfileRepository } from './repository';

let instance: UserProfileRepository | null = null;

export function getUserProfileRepository(): UserProfileRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebaseUserProfileRepository,
    } = require('./firebaseRepository') as typeof import('./firebaseRepository');
    instance = new FirebaseUserProfileRepository();
  } else {
    instance = new LocalUserProfileRepository();
  }
  return instance;
}

export function __resetUserProfileRepository(): void {
  instance = null;
}
