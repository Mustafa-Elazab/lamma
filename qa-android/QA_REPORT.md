# Lamma Android Visual QA Report

**Device:** DN2101 (`R8MRHEEYW4MJSKXO`) via USB  
**Build:** `main` @ `c2a67b3` — `npx react-native run-android --device R8MRHEEYW4MJSKXO --no-packager`  
**Mode:** `firebaseEnabled: false` (local/seeded repos)  
**Mirroring:** Vysor opened (`open -a Vysor`); captures via `adb screencap`  
**Caps:** `Documents/lamma/qa-android/caps/`  
**Date:** 2026-09-15

## Actionable: Missing / Broken

| Item | Status | Notes |
|------|--------|-------|
| Event Details cover / hero image | **Missing** | Details screen shows empty hero band; share/back icons float over blank area (ref has full cover photo). |
| Home featured card cover art | **Partial → Missing art** | Featured card is text-only; ref has large left cover image. |
| Home header logo (Lamma / لمة) + pyramids art | **Missing** | Live Home shows greeting + tagline only; no brand wordmark/illustration from ref 02. |
| Guest List via “See all” | **Broken** | Accessibility bounds are `[0,0][0,0]` — tap does nothing. Screen code exists (`GuestList`) but unreachable from Details in this build. |
| Create wizard “Next” control | **Broken** | `Next` appears in UI tree with **0×0 bounds**; could not advance Basics → When & Where → Theme. Blocks E2E create. |
| Choose Theme screen (live) | **Missing** (blocked) | Not reached because Next is untappable. |
| Share Invite screen (live) | **Missing** (not verified) | Share icon exists on Details (`openShare`); automated top-right tap did not open ShareInvite. Needs manual confirm. |
| Bottom tab label “Notifications” | **Partial / bug** | Label wraps to two lines (`Notification` / `s`) on Notifications & Profile. |
| Google Sign-In E2E | **Not verified** | `firebaseEnabled` is false; attempt interrupted by system Settings overlay. |
| Apple Sign-In | **N/A on Android** | Requires iOS device. |

## Screen checklist

| # | Screen | Status | Notes |
|---|--------|--------|-------|
| 1 | Onboarding | **Partial** | Carousel works (hero copy, Continue → Get started, Sign in, EN/AR). Last CTA is “Get started” not only “Continue”. Visual density lighter than ref 01. |
| 2 | Auth/Welcome | **Match** | Guest / Google / Apple, “No phone number. No SMS codes.”, language toggle — strong match to ref 10. |
| 3 | Home | **Partial** | Upcoming/Hosting/Past, featured + list, FAB “Create an event”, tabs OK. Missing logo/hero art & featured cover image; FAB overlaps list (“Hosting” badge clash). |
| 4 | Bottom tab bar | **Partial** | All 5 tabs present with active highlight. Notifications label wraps. Tab bar hidden while Create stack is open (expected for wizard). |
| 5 | Create — Basics | **Match** | Step indicator 1–4, title, category chips, description, live invite preview, Next present (but Next hit-target broken). |
| 6 | Create — When & Where | **Broken** | Could not open dedicated date/location/map UI; Next untappable (0×0 bounds). |
| 7 | Create — Choose Theme | **Missing** | Not reached this session. Theme assets exist in `src/assets/event-themes/`. |
| 8 | Event Details | **Partial** | Host, date/time, location, RSVP Going/Maybe/Can’t go, guest count, Share+More icons. **Cover image missing.** |
| 9 | Guest List | **Broken** | “See all” has zero bounds; list screen not opened. |
| 10 | Share Invite | **Missing** | Not visually confirmed on device this run. |
| 11 | Discover | **Match** | Search, category chips, public event cards with content (not stub). |
| 12 | Notifications feed | **Match** | Real inbox: Today/Earlier, Mark all read, invitation/RSVP/update rows — not settings. |
| 13 | Profile & Settings | **Match** | Guest header, Language, Notifications, Appearance, My drafts, Saved themes, Help & support, Sign out. |

## Functional checks

| Check | Result | Notes |
|-------|--------|-------|
| Continue as guest → Home | **Pass** | Lands on seeded Home as Guest. |
| Google Sign-In → Home | **Not verified** | Local Firebase flag off; UI button present on Welcome. |
| Apple Sign-In → Home | **N/A** | Android device. |
| 5 tabs navigate + bar visible | **Pass** (with caveats) | Home/Discover/Notifications/Profile OK; Create opens full-screen wizard without tabs. |
| Create event E2E → appears on Home | **Fail** | Blocked by untappable Next. |
| Home → Event Details | **Pass** | Wedding & Birthday Dinner open Details. |
| `adb logcat` crashes | **Initial redbox, then clean** | First launch failed JS load until `adb reverse tcp:8081 tcp:8081`. After reverse: no FATAL/React redbox in sampled logcat. |

## Environment blockers encountered

1. Mac disk full (~129 MB free) → Gradle cache corruption → cleared DerivedData + Gradle 9.4.1 caches (~22 GB freed) → **BUILD SUCCESSFUL in 19m 57s**, installed & started `com.lamma/.MainActivity`.
2. Physical device Metro: required `adb reverse tcp:8081 tcp:8081`.
3. Notification shade initially stuck open (user closed it).
4. System “Display size / Full screen” settings search overlay briefly stole focus during automation.

## Caps worth reviewing

- `caps/onboarding_1.png`, `auth_after_signin_link.png`
- `caps/home.png`, `discover.png`
- `caps/notifications_real.png`, `profile_tab.png`
- `caps/event_details_real.png`, `create_tab.png` / `create_basics_real.png`

