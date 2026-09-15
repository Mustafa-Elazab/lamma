# Lamma — لمة

**Plan, invite and celebrate together.** Lamma is a standalone React Native (CLI, RN 0.87
+ TypeScript) app for creating beautiful gatherings, inviting people, and knowing who's
coming — with first‑class Arabic + English (RTL) support and a warm, Egypt‑inspired brand.

> Authentication is **Google, Apple and Anonymous (guest) only**. There is intentionally
> **no phone number / OTP** anywhere in the app.

## Highlights

- **Design system first** — tokens (`src/design-system/theme/tokens.ts`) drive every screen;
  no hardcoded colors in screens. Light and dark token sets propagate live through the
  theme context; system mode follows the native color scheme. Atoms → molecules →
  organisms → templates, all typed.
- **Bottom tab bar is the root navigator** — Home / Discover / Create / Notifications / Profile.
- **Feature modules** — each feature has `core/{entity,repository,hooks,queryKeys}` with a
  **local + Firebase repository split** selected at runtime, and screens as
  `screens/<Name>/{index,styles,types,useController}`.
- **i18n + RTL from the start** — `en` and `ar` resource bundles with a typed schema and
  parity tests; language toggle everywhere.
- **Deep links** — invite links use `lamma.app/e/{id}` (`lamma://`, `https://lamma.app`).
- **Real assets** — onboarding art, event covers, theme art, share chrome and SVG icons all
  live in `src/assets` (no placeholder gradients for theme art).

## Screens

Onboarding (always shown to first-time users) · Auth (guest/Google/Apple) ·
Home (Upcoming/Hosting/Past, featured card — no floating FAB, the Create tab is used) ·
Create Event wizard (Basics → When & Where → Choose Theme → Preview, with **native date/time
pickers**, a **Google Maps + OpenStreetMap search** location picker, and draft autosave/resume) ·
Event Details · Guest List · Share Invite · Discover · Notifications feed ·
Profile & Settings (Edit profile, Language, Notifications, Appearance, My drafts, Saved
themes, Help, Sign out).

## Project structure

```
src/
  app/                  # providers, localization (i18n + LanguageProvider), query client, splash
  assets/               # branding, onboarding, event covers/themes, share, icons (+ index)
  config/               # env flags (firebaseEnabled, googleWebClientId, deepLinkHost)
  design-system/        # theme, atoms, molecules, organisms, templates (barrel exports)
  features/
    auth/               # Google/Apple/Anonymous + account linking, onboarding
    events/             # events entity/repos/hooks + presenters (home, details, guests, share)
    create-event/       # draft entity/validators/repos + wizard provider & screens
    discover/           # public browse/search
    notifications/      # inbox feed
    profile/            # profile & settings entry
    settings/           # preferences (notifications/appearance/saved themes) + sub-screens
  navigation/           # root/tab/stack navigators, deep-link config
  utils/                # pure helpers (date/time formatting) + tests
```

## Getting started

Requires Node >= 22.11 and a working React Native environment
([set up your environment](https://reactnative.dev/docs/set-up-your-environment)).

```sh
# 1. Install JS dependencies
npm install --legacy-peer-deps

# 2. iOS only: install pods
bundle install
bundle exec pod install --project-directory=ios

# 3. Start Metro
npm start

# 4. Run the app (in another terminal)
npm run android
# or
npm run ios
```

The production path is **Firebase Auth + Cloud Firestore only** — there is **no mock/seed
data anywhere in the default app path**. `firebaseEnabled` defaults to `true` in
`src/config/env.ts`, so Home, Discover and Notifications render real data (and real empty
states when the signed-in user has none yet).

For local development without native Firebase config, flip `firebaseEnabled` to `false`: the
app then uses `__DEV__`-only in-memory/AsyncStorage repositories that **start empty**. The
old seed content now lives only in `src/features/*/testFixtures.ts`, which is imported
exclusively by Jest and never bundled into the app.

## Quality checks

```sh
npm test           # Jest unit tests (repositories, hooks helpers, validators, i18n parity)
npx tsc --noEmit   # TypeScript type-check (no `any`)
npm run lint       # ESLint
```

## Firebase (default backend)

`firebaseEnabled` defaults to `true`, so the app expects real Firebase config. To run it:

1. Create a Firebase project and enable **Authentication** providers: Google, Apple, and
   Anonymous. (Do **not** enable Phone — the app never uses it; there is no phone/OTP flow.)
2. Enable **Cloud Firestore**.
3. Add the platform apps and config files:
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist` (add to the Xcode project)
4. Google Sign-In: copy your **Web client ID** (OAuth 2.0) into `googleWebClientId` in
   `src/config/env.ts` (this id is passed to `GoogleSignin.configure`).
5. Apple Sign-In: enable the *Sign in with Apple* capability in Xcode (iOS only).

`FirebaseAuthRepository`, `FirebaseEventRepository`, `FirebaseDraftRepository`,
`FirebaseNotificationRepository` and `FirebasePreferencesRepository` are used automatically.
Guest → provider **account linking** preserves a guest's data when they upgrade, and
`updateProfile` backs the Edit Profile screen.

Suggested Firestore layout: `events/{eventId}` (with an `rsvps` map keyed by uid),
`users/{uid}/drafts/{draftId}`, `users/{uid}/notifications/{id}`,
`users/{uid}/meta/preferences`.

The repository includes `firestore.rules` and `firebase.json`. Deploy the reviewed rules
with `firebase deploy --only firestore:rules`. Event creation requires both `hostId` and
`ownerId` to equal the fresh Firebase ID token's `uid`; user subcollections are restricted
to that same uid.

The prior event-write failure had two concrete client/rules contract problems: no Firestore
rules were versioned with the app, and the event repository silently substituted the string
`anonymous` when Firebase Auth had no current user. A protected write could therefore carry
`hostId: "anonymous"` while the rules evaluated an absent or different `request.auth.uid`,
resulting in `permission-denied`. Event creation now rejects missing auth, force-refreshes
and validates the ID token immediately before writing, writes matching `hostId` and
`ownerId`, awaits both the write and read-back, and retains the draft on any failure. The
repository logs the exact payload and sanitized Firestore result/error at the write
boundary (never the token itself).

### Cloud Functions decision

Basic event creation remains a direct, awaited client Firestore write protected by security
rules; a callable function adds no trust or consistency benefit for that operation.

One server-side function is required by the current data model:
`updateEventRsvpCounters` in `functions/src/index.ts` recalculates `goingCount` and
`attendeeCount` from the RSVP map after event writes. Rules prevent clients from changing
those aggregate fields directly. Deploy it with:

```sh
npm --prefix functions install
npm --prefix functions run build
firebase deploy --only functions:updateEventRsvpCounters
```

No invite-slug function is added because invite links currently use Firestore's unique
event document ID, not a user-facing slug. No notification fan-out function is added
because the current publish model has no invitee uid list or publish-state transition to
fan out; adding one now would invent a production data contract. When either feature is
introduced, unique slug allocation, invite notification fan-out, and any client-untrusted
publish validation belong in callable functions/triggers rather than client code.

To develop **without** native Firebase config, set `firebaseEnabled` to `false` — the app
falls back to the empty in-memory dev repositories described above.

## Splash screen (react-native-bootsplash)

The launch splash uses [`react-native-bootsplash`](https://github.com/zoontek/react-native-bootsplash)
with the Lamma logo. On JS start the logo fades/scales in (`src/app/SplashScreen.tsx`) and the
native splash is hidden with a cross-fade once the auth/onboarding gate is ready
(`src/navigation/RootNavigator.tsx`).

Android is preconfigured (`BootTheme` in `res/values/styles.xml`, `bootsplash_background`
color, `bootsplash_logo` mipmaps, the launch theme in `AndroidManifest.xml`, and
`RNBootSplash.init` in `MainActivity.kt`). To regenerate crisp per-density assets (and the
iOS `BootSplash.storyboard` + `AppDelegate` wiring), run:

```sh
npx react-native-bootsplash generate src/assets/branding/lamma_logo_exact_transparent.png \
  --platforms=android,ios --background=FFF8F4 --logo-width=180
```

## Launcher icons

The launcher uses `src/assets/branding/app_icon_source_1024.png`. Regenerate every Android
legacy/round/adaptive density and every iPhone/iPad/App Store icon with:

```sh
npm run icons
```

The script uses `sharp`, writes adaptive icon XML plus mipmap foregrounds on Android, and
updates the image files referenced by the iOS `AppIcon.appiconset`.

## Maps & location (Google Maps + OpenStreetMap)

The Create Event location picker renders Google Maps and uses the free
[OpenStreetMap Nominatim](https://nominatim.org/) API for debounced place search and reverse
geocoding. Tapping the map, dragging the marker, or choosing a search result changes the
coordinate. Confirming stores the resolved label, full address, latitude, and longitude.
The Google Maps API key is consumed only by native configuration and is never embedded in
JavaScript.

Configure a key with both **Maps SDK for Android** and **Maps SDK for iOS** enabled:

- **Android:** open the untracked `android/local.properties` file and add this exact line:
  `GOOGLE_MAPS_API_KEY=your_real_key`. Gradle injects it into the
  `com.google.android.geo.API_KEY` manifest metadata. CI may instead set the
  `GOOGLE_MAPS_API_KEY` environment variable.
- **iOS:** in Xcode, select the **Lamma target → Build Settings → All**, click **+ → Add
  User-Defined Setting**, name it `GOOGLE_MAPS_API_KEY`, and paste the key as its value for
  Debug and Release. `Info.plist` expands that build setting and `AppDelegate.swift`
  supplies it to `GMSServices`.

Restrict production keys by Android package/signing certificate and iOS bundle identifier.
Nominatim requests use an identifying User-Agent and search is debounced to respect its
public usage policy. Event Details' **Open in maps** opens the selected coordinates in the
device's mapping app.

Dates and times use native pickers via `@react-native-community/datetimepicker`, formatted as
the product copy (e.g. `Fri, 18 Dec · 8:00 PM`). The picker interprets values in the
device's local time, stores the resulting UTC epoch milliseconds, and Home/Event Details
render those timestamps in the viewer's device-local time. There is intentionally no
event-timezone field or picker.

## Deep links & Android App Links

Invite links use `https://lamma.app/e/{id}` (and the `lamma://` scheme). React Navigation
`linking` maps `e/:eventId` → Event Details, so cold/warm starts open the event in-app.

- **Android App Links**: `AndroidManifest.xml` declares an `autoVerify` intent filter for
  `https://lamma.app/e/*` plus a `lamma://` scheme filter.
- **iOS**: the `lamma://` URL scheme is registered in `Info.plist`. For universal links, add an
  Associated Domains entitlement (`applinks:lamma.app`) in Xcode.
- **Digital Asset Links**: to make Android verify the links (open in-app without a chooser),
  host `https://lamma.app/.well-known/assetlinks.json`:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.lamma",
      "sha256_cert_fingerprints": ["<your app signing SHA-256 fingerprint>"]
    }
  }
]
```

For iOS universal links, host `https://lamma.app/.well-known/apple-app-site-association`.

## Localization & RTL

Strings live in `src/app/localization/resources/{en,ar}.ts` behind a typed schema. Switching
between English and Arabic persists the choice, calls `I18nManager.allowRTL/forceRTL`, and
performs a full native restart with `react-native-restart` so every mounted native and React
Navigation view adopts the new direction. A parity test guarantees `en` and `ar` never
drift apart.
