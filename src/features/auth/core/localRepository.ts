import AsyncStorage from '@react-native-async-storage/async-storage';

import type { AuthProviderId, AuthUser } from './entity';
import type { AuthRepository } from './repository';

const STORAGE_KEY = 'lamma.auth.user';

type Listener = (user: AuthUser | null) => void;

function randomUid(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * In-memory + AsyncStorage backed auth used when Firebase is disabled. It fully
 * simulates guest upgrades: signing in with a provider while anonymous keeps the
 * same uid and merges providers, mirroring Firebase account linking.
 */
export class LocalAuthRepository implements AuthRepository {
  private user: AuthUser | null = null;
  private readonly listeners = new Set<Listener>();
  private hydrated = false;

  private async hydrate(): Promise<void> {
    if (this.hydrated) {
      return;
    }
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    this.user = raw ? (JSON.parse(raw) as AuthUser) : null;
    this.hydrated = true;
  }

  private async persist(user: AuthUser | null): Promise<void> {
    this.user = user;
    if (user) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
    this.emit();
  }

  private emit(): void {
    this.listeners.forEach(listener => listener(this.user));
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    void this.hydrate().then(() => listener(this.user));
    return () => {
      this.listeners.delete(listener);
    };
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    await this.hydrate();
    return this.user;
  }

  async signInAnonymously(): Promise<AuthUser> {
    await this.hydrate();
    const guest: AuthUser = {
      uid: randomUid('guest'),
      displayName: null,
      email: null,
      photoURL: null,
      isAnonymous: true,
      providers: ['anonymous'],
    };
    await this.persist(guest);
    return guest;
  }

  private async signInWithProvider(
    provider: Extract<AuthProviderId, 'google' | 'apple'>,
    profile: { displayName: string; email: string; photoURL: string | null },
  ): Promise<AuthUser> {
    await this.hydrate();
    const previous = this.user;
    const keepUid = previous?.isAnonymous ? previous.uid : randomUid(provider);
    const providers = previous?.isAnonymous
      ? Array.from(new Set([...previous.providers, provider]))
      : [provider];
    const upgraded: AuthUser = {
      uid: keepUid,
      displayName: profile.displayName,
      email: profile.email,
      photoURL: profile.photoURL,
      isAnonymous: false,
      providers,
    };
    await this.persist(upgraded);
    return upgraded;
  }

  signInWithGoogle(): Promise<AuthUser> {
    return this.signInWithProvider('google', {
      displayName: 'Mostafa Elazab',
      email: 'mostafa@lamma.app',
      photoURL: null,
    });
  }

  signInWithApple(): Promise<AuthUser> {
    return this.signInWithProvider('apple', {
      displayName: 'Mostafa Elazab',
      email: 'mostafa@privaterelay.appleid.com',
      photoURL: null,
    });
  }

  async signOut(): Promise<void> {
    await this.persist(null);
  }

  isAppleSupported(): boolean {
    return true;
  }
}
