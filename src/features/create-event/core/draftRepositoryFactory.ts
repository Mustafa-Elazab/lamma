import { env } from '../../../config/env';
import type { DraftRepository } from './draftRepository';
import { LocalDraftRepository } from './localDraftRepository';

let instance: DraftRepository | null = null;

export function getDraftRepository(): DraftRepository {
  if (instance) {
    return instance;
  }
  if (env.firebaseEnabled) {
    const {
      FirebaseDraftRepository,
    } = require('./firebaseDraftRepository') as typeof import('./firebaseDraftRepository');
    instance = new FirebaseDraftRepository();
  } else {
    instance = new LocalDraftRepository();
  }
  return instance;
}

export function __resetDraftRepository(): void {
  instance = null;
}
