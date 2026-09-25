/**
 * Guest (Firebase anonymous auth) session snapshot kept in encrypted MMKV.
 *
 * Firebase's native SDK remains the source of truth for restoring the signed-in
 * user (its own persistence is untouched); this record keeps the guest's uid,
 * current ID token and refresh token encrypted at rest so the app can verify on
 * launch that the restored Firebase session still belongs to the same guest.
 */
export const GUEST_SESSION_KEY = 'auth.guestSession';

export type GuestSession = {
  uid: string;
  idToken: string;
  /** ID token expiry, epoch milliseconds. */
  expiresAt: number;
  refreshToken: string | null;
  savedAt: number;
};

export function buildGuestSession(params: {
  uid: string;
  idToken: string;
  expirationTime: string;
  refreshToken?: string | null;
  now?: number;
}): GuestSession {
  const expiresAt = Date.parse(params.expirationTime);
  return {
    uid: params.uid,
    idToken: params.idToken,
    expiresAt: Number.isFinite(expiresAt) ? expiresAt : 0,
    refreshToken: params.refreshToken || null,
    savedAt: params.now ?? Date.now(),
  };
}

export function isGuestSession(value: unknown): value is GuestSession {
  if (!value || typeof value !== 'object') {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.uid === 'string' &&
    v.uid.length > 0 &&
    typeof v.idToken === 'string' &&
    typeof v.expiresAt === 'number' &&
    typeof v.savedAt === 'number'
  );
}

export function isGuestTokenExpired(
  session: GuestSession,
  now = Date.now(),
): boolean {
  return session.expiresAt <= now;
}
