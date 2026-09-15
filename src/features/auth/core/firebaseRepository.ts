import {
  appleAuth,
} from '@invertase/react-native-apple-authentication';
import {
  GoogleSignin,
} from '@react-native-google-signin/google-signin';
import {
  AppleAuthProvider,
  GoogleAuthProvider,
  getAuth,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithCredential,
  signOut,
  updateProfile,
  type AuthCredential,
  type User,
} from '@react-native-firebase/auth';
import { Platform } from 'react-native';

import { AuthError, type AuthProviderId, type AuthUser } from './entity';
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
  /** OAuth web client id required for Google sign-in on Android/iOS. */
  googleWebClientId: string;
};

export class FirebaseAuthRepository implements AuthRepository {
  constructor(private readonly config: FirebaseAuthConfig) {
    GoogleSignin.configure({ webClientId: config.googleWebClientId });
  }

  subscribe(listener: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(getAuth(), user => listener(mapUser(user)));
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    return mapUser(getAuth().currentUser);
  }

  async signInAnonymously(): Promise<AuthUser> {
    const result = await signInAnonymously(getAuth());
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
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
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
    await signOut(getAuth());
  }

  isAppleSupported(): boolean {
    return Platform.OS === 'ios' && appleAuth.isSupported;
  }
}
