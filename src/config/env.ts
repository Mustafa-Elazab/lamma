/**
 * App-wide runtime configuration flags.
 *
 * `firebaseEnabled` controls whether the real Firebase repositories are used.
 * It defaults to `true`: production runs on Firebase Auth + Firestore only,
 * with no mock/seed data anywhere in the default app path. The Android config
 * lives at `android/app/google-services.json` (and, for iOS,
 * `ios/GoogleService-Info.plist`).
 *
 * Set it to `false` locally to fall back to the `__DEV__`-only in-memory
 * repositories (which start empty) when you don't have native Firebase config
 * on hand. Jest never touches Firebase because the unit tests exercise the
 * local repositories and pure helpers directly.
 */
export const env = {
  firebaseEnabled: true,
  /**
   * Crashlytics collects in release builds only. Flip this to `true` locally
   * to test Crashlytics from a debug build (reports appear in the console
   * after the app is relaunched). Never commit it as `true`.
   */
  crashlyticsInDev: false as boolean,
  /**
   * PUBLIC_SHARE_BASE_URL: the free Vercel production domain that serves the
   * `web/` link site (`/e/{eventId}`, `/g/{code}`, `/.well-known/*`).
   * Change it here ONLY; if Vercel gives you a different project URL also
   * update the host in AndroidManifest.xml and ios/Lamma/Lamma.entitlements
   * (see web/README.md). Never use localhost or a preview URL here.
   */
  publicWebUrl: 'https://lamma-links.vercel.app',
  /** Custom scheme fallback (never shared directly). */
  customScheme: 'lamma://',
  /**
   * Store listings. Lamma is not published yet, so these are intentionally
   * empty; the web page hides a store button until its URL is set in
   * web/app.js (and here, if the app ever needs it).
   */
  playStoreUrl: '',
  appStoreUrl: '',
  /**
   * Firebase OAuth **web client id** (Google Cloud client_type 3), not the
   * Android client id. DEVELOPER_ERROR on Android means the SHA-1 of
   * `android/app/debug.keystore` (not `~/.android/debug.keystore`) is missing
   * from Firebase Android app fingerprints, then google-services.json must be
   * re-downloaded. Debug SHA-1: 5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   */
  googleWebClientId: '937768660160-22qau4s57qb7fg5cve0tgvgb3bs16b3k.apps.googleusercontent.com',
  /**
   * iOS OAuth client from google-services.json (client_type 2). Required so
   * Google Sign-In can complete natively instead of opening a browser.
   */
  googleIosClientId:
    '937768660160-hba9i9q3oujuhkfnki185o29lkb2c5ld.apps.googleusercontent.com',
} as const;

export type Env = typeof env;

export function publicWebOrigin(): string {
  return env.publicWebUrl.replace(/\/$/, '');
}

/** Base URL for every shared HTTPS link (event and game room invites). */
export const PUBLIC_SHARE_BASE_URL = publicWebOrigin();
