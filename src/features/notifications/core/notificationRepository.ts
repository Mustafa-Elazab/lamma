import { env } from '../../../config/env';
import { LocalNotificationRepository } from './localRepository';
import type { NotificationRepository } from './repository';

let instance: NotificationRepository | null = null;

export function getNotificationRepository(): NotificationRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebaseNotificationRepository,
    } = require('./firebaseRepository') as typeof import('./firebaseRepository');
    instance = new FirebaseNotificationRepository();
  } else {
    instance = new LocalNotificationRepository();
  }
  return instance;
}

export function __resetNotificationRepository(): void {
  instance = null;
}
