# Lamma link site (free, on Vercel)

This folder is a tiny static site: plain HTML, CSS and JavaScript. There's no
framework, no build step and no backend. It does three things:

1. It serves the invite landing page at `/e/{eventId}` (events) and `/g/{code}` (game rooms).
2. It serves `/.well-known/assetlinks.json` so Android can verify App Links.
3. It serves `/.well-known/apple-app-site-association` so iOS can verify Universal Links.

When Lamma is installed, Android and iOS open the app directly and this page
never loads. When it isn't installed, the browser shows this page with an
**Open in Lamma** button (it uses `lamma://`) and store buttons. There is no
automatic redirect to a store.

Nothing here requires a paid domain, Branch, AppsFlyer or Firebase Dynamic Links.
This is not deferred deep linking: if someone installs the app after tapping
a link, the app does not remember which event the link pointed to.

```
web/
├── index.html                      # the root "/" page
├── event.html                      # page for /e/* and /g/* (via vercel.json rewrites)
├── app.js                          # reads and validates the id; store URLs live here
├── styles.css
├── assets/                         # logo and icons copied from src/assets/branding
├── vercel.json                     # rewrites + JSON headers for .well-known
└── .well-known/
    ├── assetlinks.json             # Android
    └── apple-app-site-association  # iOS (no file extension)
```

## Configuration (all in one place per platform)

| What | Where |
| --- | --- |
| Share domain used by the app | `src/config/env.ts` (`publicWebUrl`, exported as `PUBLIC_SHARE_BASE_URL`) |
| Android App Link host | `android/app/src/main/AndroidManifest.xml` (`android:host`) |
| iOS Associated Domain | `ios/Lamma/Lamma.entitlements` (`applinks:…`) |
| Store buttons | `web/app.js` (`ANDROID_STORE_URL`, `IOS_STORE_URL`) |
| Android fingerprints | `web/.well-known/assetlinks.json` |
| iOS app ID | `web/.well-known/apple-app-site-association` |

Values already detected from the project:

- Android application ID is `com.getlamma.app`. (`com.lamma` is only the Kotlin namespace, and it's not what Android verifies.)
- iOS bundle ID is `com.getlamma.app`, and the Apple Team ID is `A3AGJ9J2TQ` (from `DEVELOPMENT_TEAM` in `ios/Lamma.xcodeproj/project.pbxproj`).
- The debug SHA-256 comes from `android/app/debug.keystore` and is `FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C`.

### Production Android fingerprint (you must add it before release)

Play Store builds are re-signed by Google Play App Signing, so their
certificate is **different** from the debug one. Once the app is in Play Console, do this:

1. Open **Google Play Console**, pick the app, and go to **Setup**, then **App integrity**, then **App signing**.
2. Copy the **SHA-256 certificate fingerprint** from the "App signing key certificate" section.
3. Add it as a second entry in `sha256_cert_fingerprints` in `.well-known/assetlinks.json`:
   ```json
   "sha256_cert_fingerprints": [
     "FA:C6:17:45:DC:09:03:78:6F:B9:ED:E6:2A:96:2B:39:9F:73:48:F0:BB:6F:89:9B:83:32:66:75:91:03:3B:9C",
     "PASTE_PLAY_APP_SIGNING_SHA256_HERE"
   ]
   ```
4. If you also sideload a release APK signed with your own upload key, add that
   key's SHA-256 too. You can print it with `keytool -list -v -keystore <your.keystore>`.

### Apple Team ID

`A3AGJ9J2TQ` is already filled in. If you ever move to a different team, find the new ID
under **Apple Developer account**, then **Membership Details**, then **Team ID**, and update both
the AASA file and the Xcode signing team. The iPhone build also needs the
**Associated Domains** capability enabled for the App ID (Xcode's automatic signing
does this when the entitlement is present).

## Deploy: Method A (recommended), GitHub and the Vercel dashboard

1. Push the code:
   ```bash
   git status
   git add .
   git commit -m "feat: add free Vercel app links"
   git push
   ```
2. Open <https://vercel.com> and sign in with GitHub.
3. Click **Add New…**, then **Project**, and import the `Mustafa-Elazab/lamma` repository.
4. Configure it:
   - **Project Name** is `lamma-links`, which gives you `https://lamma-links.vercel.app`.
   - **Framework Preset** is **Other**.
   - **Root Directory** is `web`. This matters, because the repo root is the React
     Native app and Vercel must not try to build it.
   - **Build Command** stays empty (turn the override on and leave it blank).
   - **Output Directory** is `.` (the root of `web`).
   - **Install Command** stays empty.
5. Don't add or buy a domain. The free `*.vercel.app` production domain is all you need.
6. Click **Deploy**.
7. From then on, every push to the production branch (`main`) redeploys automatically.
   Other branches get preview URLs such as `lamma-links-git-xyz.vercel.app`. **Never**
   put a preview URL in the app, the manifest or the entitlements. Only use the production domain.

### If the name `lamma-links` is taken

Vercel then gives you a different production URL (for example
`lamma-links-abc.vercel.app`). Copy it from the project's **Domains** list and then:

1. Update `publicWebUrl` in `src/config/env.ts`.
2. Update `android:host` in `android/app/src/main/AndroidManifest.xml`.
3. Update `applinks:` in `ios/Lamma/Lamma.entitlements`.
4. Update the absolute `og:image` URL in `web/event.html` (optional).
5. Push again so Vercel redeploys, then rebuild **and reinstall** both mobile apps.
   The association files don't contain the host, so they don't change.

## Deploy: Method B (optional), the Vercel CLI

```bash
npm install -g vercel
cd web
vercel          # first run links or creates the project (answer: root is ./, no build)
vercel --prod   # deploy to the production domain
```

## Local preview (browser UI only)

```bash
cd web
npx serve .     # or: python3 -m http.server 8080
```

A plain static server won't apply the `/e/*` rewrite, so open
`http://localhost:8080/event.html` to see the page. You can also run `vercel dev`, which
applies `vercel.json`. localhost can **never** verify App Links or Universal Links. Only the
public HTTPS production domain can.

## After deploying, check these

Each of these must return HTTP **200** with **no redirect**:

```bash
curl -sI https://lamma-links.vercel.app/e/test-event
curl -sI https://lamma-links.vercel.app/.well-known/assetlinks.json
curl -sI https://lamma-links.vercel.app/.well-known/apple-app-site-association
curl -s  https://lamma-links.vercel.app/.well-known/assetlinks.json | python3 -m json.tool
curl -s  https://lamma-links.vercel.app/.well-known/apple-app-site-association | python3 -m json.tool
```

Google's checker is at
`https://digitalassetlinks.googleapis.com/v1/statements:list?source.web.site=https://lamma-links.vercel.app&relation=delegate_permission/common.handle_all_urls`.
Apple caches the AASA through its CDN, which you can check at `https://app-site-association.cdn-apple.com/a/v1/lamma-links.vercel.app`.
That CDN can take a while to pick up changes.

## Testing on Android (real device)

```bash
# App Link (HTTPS). This should open Lamma, not the browser.
adb shell am start -a android.intent.action.VIEW \
  -c android.intent.category.BROWSABLE \
  -d "https://lamma-links.vercel.app/e/TEST_EVENT_ID"

# Custom scheme fallback
adb shell am start -a android.intent.action.VIEW -d "lamma://e/TEST_EVENT_ID"

# Game room link
adb shell am start -a android.intent.action.VIEW -d "https://lamma-links.vercel.app/g/ABCD23"

# Verification status (Android 12+). You want "lamma-links.vercel.app: verified".
adb shell pm get-app-links com.getlamma.app

# Re-run verification after deploying or changing assetlinks.json
adb shell pm verify-app-links --re-verify com.getlamma.app
# If it still isn't verified: uninstall, then reinstall the app
adb uninstall com.getlamma.app && yarn android
```

If Android shows a chooser or opens Chrome, verification failed. The usual
causes are a wrong package name, a missing fingerprint for the build you
installed, or a redirect on `assetlinks.json`.

## Testing on iOS (real iPhone)

Typing the URL into Safari's address bar is **not** a valid Universal Link test,
because Safari deliberately stays in the browser in that case.

1. Install a development build on a real iPhone (for example `yarn ios --device`, or run from Xcode).
2. Put `https://lamma-links.vercel.app/e/TEST_EVENT_ID` in Notes, Messages or Mail.
3. Tap it. Lamma should launch and open Event Details.
4. Separately, tap `lamma://e/TEST_EVENT_ID` in Notes (the custom scheme).

If it opens Safari, long-press the link and check whether "Open in Lamma" appears.
Also confirm the build has the Associated Domains entitlement, and note that a new
install fetches the AASA again. For development you can enable
**Settings**, then **Developer**, then **Associated Domains Development**.

## Test matrix

| Platform | Case | Expected |
| --- | --- | --- |
| Android/iOS | App installed, valid event | Lamma opens Event Details |
| Android/iOS | App installed, unknown event id | Lamma shows "Event not found" with a Back button |
| Android/iOS | App installed, malformed link (`/e/`, `/e/%00`, `/e/../x`) | App opens on its normal screen and ignores the link |
| Android/iOS | App not installed | Browser shows the Lamma invite page, with no automatic store redirect |
| Android/iOS | `lamma://e/{id}` | Lamma opens Event Details |
| Both | Cold start, background, foreground (a second link while open) | Event Details opens once for each tap |
| Both | Signed out or first run | Onboarding and sign-in finish first, then the event opens |

Opening a link only navigates to a screen. It never RSVPs, joins, accepts or submits anything.
