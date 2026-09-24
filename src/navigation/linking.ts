import type { LinkingOptions } from '@react-navigation/native';

import { env, PUBLIC_SHARE_BASE_URL } from '../config/env';
import type { RootStackParamList } from './types';

const CUSTOM_SCHEME = env.customScheme;

/** Firestore-style ids: letters, digits, `_` and `-`, at most 128 chars. */
const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;
const ROOM_CODE_PATTERN = /^[A-Z0-9]{4,12}$/;

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/** Returns the path after our HTTPS origin or custom scheme, or null. */
function pathFromLink(url: string): string | null {
  if (typeof url !== 'string' || url.length > 2048) {
    return null;
  }
  const origin = `${PUBLIC_SHARE_BASE_URL}/`;
  if (url.toLowerCase().startsWith(origin.toLowerCase())) {
    return url.slice(origin.length);
  }
  if (url.toLowerCase().startsWith(CUSTOM_SCHEME)) {
    return url.slice(CUSTOM_SCHEME.length);
  }
  return null;
}

function segmentAfter(url: string, prefix: 'e' | 'g'): string | null {
  const path = pathFromLink(url);
  if (path == null) {
    return null;
  }
  const clean = path.split(/[?#]/)[0] ?? '';
  const parts = clean.split('/').filter(Boolean);
  if (parts[0] !== prefix || !parts[1]) {
    return null;
  }
  return safeDecode(parts[1]);
}

/** True for any `/e/…` or `/g/…` URL on our origin or scheme (valid or not). */
export function isInviteLink(url: string): boolean {
  const path = pathFromLink(url);
  if (path == null) {
    return false;
  }
  const first = path.replace(/^\/+/, '').split(/[/?#]/)[0];
  return first === 'e' || first === 'g';
}

export function isValidEventId(value: string | null | undefined): value is string {
  return typeof value === 'string' && EVENT_ID_PATTERN.test(value);
}

/**
 * Invite links are free HTTPS App Links / Universal Links on the Vercel
 * domain (`PUBLIC_SHARE_BASE_URL/e/{id}`), with `lamma://e/{id}` as fallback.
 *
 * `/e/*` and `/g/*` are deliberately NOT resolved by React Navigation: they
 * are handled by `usePendingLink`, which waits for auth + onboarding, validates
 * the id and navigates exactly once. Everything else resolves normally.
 */
export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [CUSTOM_SCHEME, PUBLIC_SHARE_BASE_URL],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Discover: 'discover',
          Games: {
            path: 'games',
            screens: {
              GamesHub: '',
              GameLobby: ':gameId',
            },
          },
          Notifications: 'notifications',
          Profile: 'profile',
        },
      },
      EventDetails: 'e/:eventId',
      GuestList: 'e/:eventId/guests',
      ShareInvite: 'e/:eventId/share',
    },
  },
  filter: url => !isInviteLink(url),
};

/** Canonical HTTPS share URL. This is the only event link users share. */
export function buildEventDeepLink(eventId: string): string {
  return `${PUBLIC_SHARE_BASE_URL}/e/${encodeURIComponent(eventId)}`;
}

/** Custom-scheme URL (fallback only, never shared). */
export function buildEventAppLink(eventId: string): string {
  return `${CUSTOM_SCHEME}e/${encodeURIComponent(eventId)}`;
}

/** Validated event id from an HTTPS or custom-scheme link, else null. */
export function eventIdFromLink(url: string): string | null {
  const id = segmentAfter(url, 'e');
  return isValidEventId(id) ? id : null;
}

/** Shareable HTTPS invite for a game room (opens the app when installed). */
export function buildGameRoomLink(code: string): string {
  return `${PUBLIC_SHARE_BASE_URL}/g/${encodeURIComponent(code)}`;
}

/** Custom-scheme URL that opens the installed app straight into a room. */
export function buildGameRoomAppLink(code: string): string {
  return `${CUSTOM_SCHEME}g/${encodeURIComponent(code)}`;
}

export function roomCodeFromLink(url: string): string | null {
  const code = segmentAfter(url, 'g')?.toUpperCase() ?? null;
  return code && ROOM_CODE_PATTERN.test(code) ? code : null;
}

export type PendingLink =
  | { kind: 'event'; eventId: string }
  | { kind: 'room'; code: string };

export function parseIncomingLink(url: string | null | undefined): PendingLink | null {
  if (!url) {
    return null;
  }
  const eventId = eventIdFromLink(url);
  if (eventId) {
    return { kind: 'event', eventId };
  }
  const code = roomCodeFromLink(url);
  return code ? { kind: 'room', code } : null;
}
