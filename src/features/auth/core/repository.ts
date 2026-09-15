import type { AuthProviderId, AuthUser } from './entity';

/**
 * Auth persistence contract. Implemented twice: a local repository used in
 * development/CI (no native config required) and a Firebase-backed repository
 * for production. Neither implementation exposes phone/OTP by design.
 */
export interface AuthRepository {
  /** Emits the current user immediately and on every auth state change. */
  subscribe(listener: (user: AuthUser | null) => void): () => void;
  getCurrentUser(): Promise<AuthUser | null>;
  signInAnonymously(): Promise<AuthUser>;
  /**
   * Signs in with Google. If the current session is an anonymous guest, the
   * guest account is linked/upgraded so its data is preserved.
   */
  signInWithGoogle(): Promise<AuthUser>;
  /** Same linking behaviour as {@link signInWithGoogle} for Apple. */
  signInWithApple(): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Whether Apple sign-in is available on the current platform. */
  isAppleSupported(): boolean;
}

export const GUEST_PROVIDERS: AuthProviderId[] = ['anonymous'];
