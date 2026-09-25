import 'react-native-get-random-values';
import * as Keychain from 'react-native-keychain';
import { createMMKV, type MMKV } from 'react-native-mmkv';

import { reportError } from './crashReporting';

/**
 * Encrypted key/value storage for secrets (auth session tokens).
 *
 * - Data lives in a dedicated MMKV instance encrypted with AES-256.
 * - The 32-character encryption key is generated once from a CSPRNG
 *   (`crypto.getRandomValues`, polyfilled by react-native-get-random-values)
 *   and kept in the iOS Keychain / Android Keystore via react-native-keychain,
 *   so it never sits in JS bundles, AsyncStorage or plain files.
 */
const STORAGE_ID = 'lamma.secure';
const KEY_SERVICE = 'com.getlamma.app.secure-storage-key';
const KEY_USERNAME = 'mmkv-encryption-key';
const KEY_ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

let storagePromise: Promise<MMKV> | null = null;

type CryptoLike = { getRandomValues: (array: Uint8Array) => Uint8Array };

function cryptoApi(): CryptoLike {
  const api = (globalThis as { crypto?: CryptoLike }).crypto;
  if (!api?.getRandomValues) {
    throw new Error('secure-storage/no-csprng: crypto.getRandomValues missing');
  }
  return api;
}

/** 32 chars from a 64-symbol alphabet = 192 bits of entropy. */
export function generateEncryptionKey(length = 32): string {
  const bytes = new Uint8Array(length);
  cryptoApi().getRandomValues(bytes);
  let key = '';
  for (let i = 0; i < bytes.length; i += 1) {
    key += KEY_ALPHABET[bytes[i] % KEY_ALPHABET.length];
  }
  return key;
}

async function loadOrCreateKey(): Promise<string> {
  const existing = await Keychain.getGenericPassword({ service: KEY_SERVICE });
  if (existing && existing.password) {
    return existing.password;
  }
  const key = generateEncryptionKey();
  await Keychain.setGenericPassword(KEY_USERNAME, key, {
    service: KEY_SERVICE,
    accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY,
  });
  return key;
}

async function openStorage(): Promise<MMKV> {
  const encryptionKey = await loadOrCreateKey();
  return createMMKV({
    id: STORAGE_ID,
    encryptionKey,
    encryptionType: 'AES-256',
    recoveryStrategy: 'discard-on-error',
  });
}

/** Lazily opens the encrypted store (one instance per app process). */
export function getSecureStorage(): Promise<MMKV> {
  if (!storagePromise) {
    storagePromise = openStorage().catch(error => {
      storagePromise = null;
      reportError(error, 'secure-storage.open');
      throw error;
    });
  }
  return storagePromise;
}

export async function secureSetJSON(key: string, value: unknown): Promise<void> {
  const storage = await getSecureStorage();
  storage.set(key, JSON.stringify(value));
}

export async function secureGetJSON<T>(key: string): Promise<T | null> {
  const storage = await getSecureStorage();
  const raw = storage.getString(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    storage.remove(key);
    return null;
  }
}

export async function secureRemove(key: string): Promise<void> {
  const storage = await getSecureStorage();
  storage.remove(key);
}
