import {
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
  isErrorWithCode,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {
  AppleAuthProvider,
  GoogleAuthProvider,
  getAuth,
  linkWithCredential,
  onAuthStateChanged,
  onIdTokenChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
  updateProfile,
  type AuthCredential,
  type User,
} from '@react-native-firebase/auth';
import { Linking, Platform } from 'react-native';

import { reportError } from '../../../services/crashReporting';
import { appLogger } from '../../../services/logger';
import { AuthError, type AuthProviderId, type AuthUser } from './entity';
import { isGuestTokenExpired } from './guestSession';
import {
  clearGuestSession,
  readGuestSession,
  saveGuestSession,
} from './guestSessionStore';
import type { AuthRepository } from './repository';

function mapProviders(
  user: User,
): AuthProviderId[] {
  if (user.isAnonymous) {
    return ['anonymous'];
  }
  const providers = user.providerData.map((info): AuthProviderId | null => {
    if (info.providerId.includes('google')) {
      return 'google';
    }
    if (info.providerId.includes('apple')) {
      return 'apple';
    }
    return null;
  });
  return providers.filter((p): p is AuthProviderId => p !== null);
}

function mapUser(user: User | null): AuthUser | null {
  if (!user) {
    return null;
  }
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
    providers: mapProviders(user),
  };
}

export type FirebaseAuthConfig = {
  /** OAuth web client id required for Google sign-in id tokens. */
  googleWebClientId: string;
  /** iOS OAuth client id (client_type 2) so the native SDK can return. */
  googleIosClientId: string;
};

const PLAY_SERVICES_PACKAGE = 'com.google.android.gms';

async function openPlayServicesStore(): Promise<void> {
  const market = `market://details?id=${PLAY_SERVICES_PACKAGE}`;
  const web = `https://play.google.com/store/apps/details?id=${PLAY_SERVICES_PACKAGE}`;
  const supported = await Linking.canOpenURL(market);
  await Linking.openURL(supported ? market : web);
}

export class FirebaseAuthRepository implements AuthRepository {
  constructor(private readonly config: FirebaseAuthConfig) {
    GoogleSignin.configure({
      webClientId: config.googleWebClientId,
      iosClientId: config.googleIosClientId,
      offlineAccess: false,
      forceCodeForRefreshToken: false,
      scopes: ['profile', 'email'],
    });
  }

  private launchChecked = false;

  /**
   * Keeps the encrypted guest session in sync with Firebase's own persisted
   * user. On the first auth callback after launch the stored session is read
   * back and compared with the restored Firebase user.
   */
  private async syncGuestSession(user: User | null): Promise<void> {
    if (!this.launchChecked) {
      this.launchChecked = true;
      const stored = await readGuestSession();
      if (stored) {
        appLogger.log('[auth.guest-session] Restored encrypted guest session', {
          uid: stored.uid,
          matchesFirebaseUser: stored.uid === user?.uid,
          tokenExpired: isGuestTokenExpired(stored),
        });
      }
    }
    if (user?.isAnonymous) {
      await saveGuestSession(user);
    } else {
      // Signed out, or upgraded to Google/Apple: no guest token to keep.
      await clearGuestSession();
    }
  }

  private syncGuestSessionSafely(user: User | null): void {
    this.syncGuestSession(user).catch(error => {
      reportError(error, 'auth.guest-session-sync');
    });
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    const auth = getAuth();
    // ID token changes cover sign-in, sign-out and hourly token refreshes.
    const stopTokenSync = onIdTokenChanged(auth, user =>
      this.syncGuestSessionSafely(user),
    );
    const stopAuth = onAuthStateChanged(auth, user => listener(mapUser(user)));
    return () => {
      stopTokenSync();
      stopAuth();
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return mapUser(getAuth().currentUser);
  }

  async signInAnonymously(): Promise<AuthUser> {
    const result = await signInAnonymously(getAuth());
    try {
      await saveGuestSession(result.user);
    } catch (error) {
      // Never block sign-in on the encrypted cache; Firebase still persists.
      reportError(error, 'auth.guest-session-save');
    }
    return mapUser(result.user) as AuthUser;
  }

  private async authenticateWithCredential(
    credential: AuthCredential,
  ): Promise<AuthUser> {
    const auth = getAuth();
    const current = auth.currentUser;
    if (current?.isAnonymous) {
      try {
        const linked = await linkWithCredential(current, credential);
        return mapUser(linked.user) as AuthUser;
      } catch (error) {
        const code = (error as { code?: string }).code ?? '';
        if (
          code !== 'auth/credential-already-in-use' &&
          code !== 'auth/email-already-in-use'
        ) {
          throw error;
        }
        // Credential already belongs to an existing account: fall back to a
        // normal sign-in so the user still gets in.
      }
    }
    const result = await signInWithCredential(auth, credential);
    return mapUser(result.user) as AuthUser;
  }

  async signInWithGoogle(): Promise<AuthUser> {
    if (Platform.OS === 'android') {
      try {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      } catch (error) {
        const missing =
          isErrorWithCode(error) &&
          error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE;
        if (missing) {
          await openPlayServicesStore();
          throw new AuthError(
            'auth/play-services',
            'auth.errorPlayServices',
          );
        }
        throw error;
      }
    }

    const response = await GoogleSignin.signIn();
    if (response.type === 'cancelled') {
      throw new AuthError('auth/cancelled', 'Google sign-in was cancelled.');
    }
    const idToken =
      response.data?.idToken ?? (await GoogleSignin.getTokens()).idToken;
    if (!idToken) {
      throw new AuthError('auth/no-id-token', 'Google did not return a token.');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    return this.authenticateWithCredential(credential);
  }

  async signInWithApple(): Promise<AuthUser> {
    const response = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
    const { identityToken, nonce } = response;
    if (!identityToken) {
      throw new AuthError('auth/no-id-token', 'Apple did not return a token.');
    }
    const credential = AppleAuthProvider.credential(identityToken, nonce);
    return this.authenticateWithCredential(credential);
  }

  async updateProfile(patch: { displayName: string }): Promise<AuthUser> {
    const auth = getAuth();
    const current = auth.currentUser;
    if (!current) {
      throw new AuthError('auth/no-current-user', 'No signed-in user.');
    }
    await updateProfile(current, { displayName: patch.displayName });
    await current.reload();
    return mapUser(auth.currentUser) as AuthUser;
  }

  async signOut(): Promise<void> {
    try {
      await GoogleSignin.signOut();
    } catch {
      // Native Google session may not exist (guest / Apple-only).
    }
    await signOut(getAuth());
    await clearGuestSession().catch(error => {
      reportError(error, 'auth.guest-session-clear');
    });
  }

  isAppleSupported(): boolean {
    return Platform.OS === 'ios' && appleAuth.isSupported;
  }
}
