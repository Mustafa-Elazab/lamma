import { secureGetJSON, secureRemove, secureSetJSON } from '../../../services/secureStorage';
import {
  buildGuestSession,
  GUEST_SESSION_KEY,
  isGuestSession,
  type GuestSession,
} from './guestSession';

type TokenUser = {
  uid: string;
  isAnonymous: boolean;
  refreshToken?: string | null;
  getIdTokenResult: (
    forceRefresh?: boolean,
  ) => Promise<{ token: string; expirationTime: string }>;
};

/** Saves the anonymous user's current ID token into encrypted MMKV. */
export async function saveGuestSession(user: TokenUser): Promise<GuestSession | null> {
  if (!user.isAnonymous) {
    return null;
  }
  const result = await user.getIdTokenResult();
  const session = buildGuestSession({
    uid: user.uid,
    idToken: result.token,
    expirationTime: result.expirationTime,
    refreshToken: user.refreshToken ?? null,
  });
  await secureSetJSON(GUEST_SESSION_KEY, session);
  return session;
}

export async function readGuestSession(): Promise<GuestSession | null> {
  const value = await secureGetJSON<unknown>(GUEST_SESSION_KEY);
  return isGuestSession(value) ? value : null;
}

export async function clearGuestSession(): Promise<void> {
  await secureRemove(GUEST_SESSION_KEY);
}
