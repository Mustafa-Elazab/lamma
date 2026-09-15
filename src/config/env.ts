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
  deepLinkHost: 'lamma.app',
  /**
   * Firebase OAuth **web client id** used to enable Google sign-in. Replace the
   * placeholder with the Web client id from your Firebase project's OAuth 2.0
   * credentials (see the README "Enabling Firebase" section).
   */
  googleWebClientId: 'REPLACE_WITH_FIREBASE_WEB_CLIENT_ID.apps.googleusercontent.com',
} as const;

export type Env = typeof env;
