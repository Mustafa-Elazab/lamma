/**
 * App-wide runtime configuration flags.
 *
 * `firebaseEnabled` controls whether the real Firebase repositories are used.
 * It defaults to `false` so the app boots and is fully usable in development
 * and CI without native Firebase config files. Set it to `true` (and add the
 * platform config files described in the README) to switch to Firebase.
 */
export const env = {
  firebaseEnabled: false,
  deepLinkHost: 'lamma.app',
  /** Populate with your Firebase OAuth web client id to enable Google sign-in. */
  googleWebClientId: '937768660160-22qau4s57qb7fg5cve0tgvgb3bs16b3k.apps.googleusercontent.com',
} as const;

export type Env = typeof env;
