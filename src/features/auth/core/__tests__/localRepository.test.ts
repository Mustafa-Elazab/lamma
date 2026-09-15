import AsyncStorage from '@react-native-async-storage/async-storage';

import { LocalAuthRepository } from '../localRepository';

describe('LocalAuthRepository', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it('signs in an anonymous guest', async () => {
    const repo = new LocalAuthRepository();
    const user = await repo.signInAnonymously();
    expect(user.isAnonymous).toBe(true);
    expect(user.providers).toEqual(['anonymous']);
    expect(user.uid).toMatch(/^guest_/);
  });

  it('upgrades a guest to Google keeping the same uid (account linking)', async () => {
    const repo = new LocalAuthRepository();
    const guest = await repo.signInAnonymously();
    const upgraded = await repo.signInWithGoogle();

    expect(upgraded.uid).toBe(guest.uid);
    expect(upgraded.isAnonymous).toBe(false);
    expect(upgraded.providers).toContain('anonymous');
    expect(upgraded.providers).toContain('google');
    expect(upgraded.email).toBeTruthy();
  });

  it('creates a fresh account when signing in without a guest session', async () => {
    const repo = new LocalAuthRepository();
    const user = await repo.signInWithApple();
    expect(user.isAnonymous).toBe(false);
    expect(user.providers).toEqual(['apple']);
    expect(user.uid).toMatch(/^apple_/);
  });

  it('notifies subscribers and clears on sign out', async () => {
    const repo = new LocalAuthRepository();
    const seen: (string | null)[] = [];
    const unsubscribe = repo.subscribe(user => seen.push(user?.uid ?? null));
    await repo.signInAnonymously();
    await repo.signOut();
    unsubscribe();
    expect(seen[seen.length - 1]).toBeNull();
    expect(await repo.getCurrentUser()).toBeNull();
  });

  it('updates the display name of the signed-in user', async () => {
    const repo = new LocalAuthRepository();
    await repo.signInWithGoogle();
    const updated = await repo.updateProfile({ displayName: 'Mostafa' });
    expect(updated.displayName).toBe('Mostafa');
    const restored = await new LocalAuthRepository().getCurrentUser();
    expect(restored?.displayName).toBe('Mostafa');
  });

  it('persists the session across repository instances', async () => {
    const first = new LocalAuthRepository();
    await first.signInWithGoogle();
    const second = new LocalAuthRepository();
    const restored = await second.getCurrentUser();
    expect(restored?.providers).toContain('google');
  });
});
