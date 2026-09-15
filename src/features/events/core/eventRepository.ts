import { env } from '../../../config/env';
import { LocalEventRepository } from './localRepository';
import type { EventRepository } from './repository';

let instance: EventRepository | null = null;

export function getEventRepository(): EventRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebaseEventRepository,
    } = require('./firebaseRepository') as typeof import('./firebaseRepository');
    instance = new FirebaseEventRepository();
  } else {
    instance = new LocalEventRepository();
  }
  return instance;
}

export function __resetEventRepository(): void {
  instance = null;
}
