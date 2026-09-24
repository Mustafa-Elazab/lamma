import { env } from '../../../../config/env';
import type { GameSessionTransportAdapter } from './transport';
import { LocalRoomCodeSessionAdapter } from './transport';

let adapter: GameSessionTransportAdapter | null = null;

/**
 * Prefer Firestore room codes when Firebase is on so hosts/guests on different
 * devices (physical phone + simulator, LAN/Wi‑Fi gaps, etc.) can join by code.
 * Players never need to share a network: rooms live in Firestore and anyone
 * with the code or invite link can join over the internet. Native
 * Nearby/Multipeer is intentionally not used.
 */
export function getGameSessionTransport(): GameSessionTransportAdapter {
  if (adapter) {
    return adapter;
  }
  if (env.firebaseEnabled) {
    try {
      const {
        FirestoreRoomCodeSessionAdapter,
      } = require('./firebaseTransport') as typeof import('./firebaseTransport');
      adapter = new FirestoreRoomCodeSessionAdapter();
      return adapter;
    } catch {
      // Fall through to native / local adapters.
    }
  }
  adapter = new LocalRoomCodeSessionAdapter();
  return adapter;
}

export function __setGameSessionTransportForTest(
  next: GameSessionTransportAdapter | null,
): void {
  adapter = next;
}
