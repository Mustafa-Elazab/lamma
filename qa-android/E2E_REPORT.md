# Lamma E2E Report
Generated: 2026-09-17T01:58:33.539535

## NativeRNFBTurboApp fix

**Root cause:** Stale New Architecture autolinking cache (`android/build/generated/autolinking/autolinking.json`) listed `@react-native-firebase/*` with `libraryName: null` and wrong `cmakeListsPath` (`build/generated/source/codegen/jni` instead of committed `generated/jni`). Bridgeless ModuleProvider therefore never registered `NativeRNFBTurboApp` into `libappmodules.so` even after clean rebuilds. Package versions (all 26.4.0), `newArchEnabled=true`, google-services, and Java packages were already correct.

**Fix applied:** Deleted `android/build`, `android/app/build`, `android/app/.cxx`, regenerated autolinking, `assembleDebug -PreactNativeArchitectures=arm64-v8a`, uninstall+install. Verified `NativeRNFBTurboApp` symbols in `libappmodules.so`. App launched to Welcome; Messaging + Remote Config logged success.

## Checklist

1. **PARTIAL** — guest continue; Google/Apple pending; Google/Apple Sign-In need interactive OAuth — not fully automated
2. **NOT_RUN** — 
3. **FAIL** — Profile tab missing
4. **FAIL** — home markers=0; refresh gestured
5. **FAIL** — Create wizard not opened
6. **SKIP** — Needs published event
7. **SKIP** — Needs published event
8. **SKIP** — Needs published event + share targets
9. **FAIL** — miss Home; miss Discover; miss Create; miss Notifications; miss Profile
10. **PARTIAL** — Discover texts=['L', 'Welcome to Lamma', 'Plan, invite and celebrate together.', 'Continue as guest', 'or', 'Continue with Google', 'No phone number. No SMS codes.', 'Guest activity stays with your account when you upgrade.', 'English', 'العربية']; Notifications/Profile checked via tabs
11. **SKIP** — Command '['adb', '-s', 'adb-R8MRHEEYW4MJSKXO-8k5Rdt._adb-tls-connect._tcp', 'shell', 'uiautomator', 'dump', '/sdcard/ui.xml']' returned non-zero exit status 1.

## Notes
- Firebase Console rules still likely undeployed → publish may permission-deny.
- Google/Apple sign-in require interactive account UI.
- Screenshots under `qa-android/caps/e2e_*.png`.
