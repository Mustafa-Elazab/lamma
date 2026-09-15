# Lamma — لمة

**Plan, invite and celebrate together.** Lamma is a standalone React Native (CLI, RN 0.87
+ TypeScript) app for creating beautiful gatherings, inviting people, and knowing who's
coming — with first‑class Arabic + English (RTL) support and a warm, Egypt‑inspired brand.

> Authentication is **Google, Apple and Anonymous (guest) only**. There is intentionally
> **no phone number / OTP** anywhere in the app.

## Highlights

- **Design system first** — tokens (`src/design-system/theme/tokens.ts`) drive every screen;
  no hardcoded colors in screens. Atoms → molecules → organisms → templates, all typed.
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

Onboarding · Auth (guest/Google/Apple) · Home (Upcoming/Hosting/Past, featured card, FAB) ·
Create Event wizard (Basics → When & Where → Choose Theme → Preview, with draft autosave) ·
Event Details · Guest List · Share Invite · Discover · Notifications feed ·
Profile & Settings (Language, Notifications, Appearance, My drafts, Saved themes, Help,
Sign out).

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

The app boots straight into the tab bar and is **fully usable without any backend**: when
`firebaseEnabled` is `false` (the default in `src/config/env.ts`), local repositories with
realistic seed data back every feature (auth, events, drafts, notifications, preferences).

## Quality checks

```sh
npm test           # Jest unit tests (repositories, hooks helpers, validators, i18n parity)
npx tsc --noEmit   # TypeScript type-check (no `any`)
npm run lint       # ESLint
```

## Enabling Firebase

Firebase is integrated behind a flag so development/CI never require native config files.

1. Create a Firebase project and enable **Authentication** providers: Google, Apple, and
   Anonymous. (Do **not** enable Phone — the app never uses it.)
2. Enable **Cloud Firestore**.
3. Add the platform apps and config files:
   - Android: `android/app/google-services.json`
   - iOS: `ios/GoogleService-Info.plist` (add to the Xcode project)
4. Google Sign-In: copy your **Web client ID** (OAuth 2.0) into
   `googleWebClientId` in `src/config/env.ts`.
5. Apple Sign-In: enable the *Sign in with Apple* capability in Xcode (iOS only).
6. Flip `firebaseEnabled` to `true` in `src/config/env.ts`.

Once enabled, the `FirebaseAuthRepository`, `FirebaseEventRepository`,
`FirebaseDraftRepository`, `FirebaseNotificationRepository` and
`FirebasePreferencesRepository` are used automatically. Guest → provider **account linking**
is handled so a guest's data is preserved when they upgrade.

Suggested Firestore layout: `events/{eventId}` (with an `rsvps` map keyed by uid),
`users/{uid}/drafts/{draftId}`, `users/{uid}/notifications/{id}`,
`users/{uid}/meta/preferences`.

## Localization & RTL

Strings live in `src/app/localization/resources/{en,ar}.ts` behind a typed schema. Switching
to Arabic flips layout direction via `I18nManager`. A parity test guarantees `en` and `ar`
never drift apart.
