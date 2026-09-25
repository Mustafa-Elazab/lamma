export type AuthProviderId = 'google' | 'apple' | 'anonymous';

export type AuthUser = {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
  providers: AuthProviderId[];
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type SignInMethod = Exclude<AuthProviderId, never>;

export class AuthError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
  }
}

export function isGuest(user: AuthUser | null): boolean {
  return Boolean(user?.isAnonymous);
}

export function displayNameOrGuest(
  user: AuthUser | null,
  guestLabel: string,
): string {
  // Guests can pick a name during profile setup, so use it when present.
  return user?.displayName?.trim() || guestLabel;
}
