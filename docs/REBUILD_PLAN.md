# Lamma Standalone Rebuild Plan

**Location:** `/Users/mostafamohamedelazab/Documents/lamma` (standalone — NOT dawwar monorepo)
**GitHub:** https://github.com/Mustafa-Elazab/lamma
**Auth:** Google + Apple + Anonymous only. No phone/OTP ever.

## Folder structure

```
src/
  assets/                 # self-contained media + icons
  design-system/
    theme/tokens.ts
    atoms/ molecules/ organisms/ templates/
  features/<name>/
    core/{entity,repository,hooks,queryKeys}
    screens/<Name>/{index,styles,types,useController}
  navigation/             # bottom tabs = root
  app/{entry,localization}
design-reference/         # 10 UI screenshots
docs/
```

## Atomic inventory

| Tier | Components |
|------|------------|
| atoms | Button, Text, Input, Avatar, Badge, Icon, Chip, Skeleton |
| molecules | Card, ListItem, EmptyState, ErrorState, StepIndicator, SegmentedTabs |
| organisms | EventCard (featured/compact), GuestRow, ThemeSwatch |
| templates | ScreenTemplate |

## Screens → refs

| Screen | Ref | Model |
|--------|-----|-------|
| Design-system foundation | — | **Claude Opus** |
| Architecture / nav shell + tabs | all | **Claude Opus** |
| Onboarding | 01 | Gemini Flash |
| Auth (Guest/Google/Apple) | 10 | **Claude Opus** (auth+linking) |
| Home | 02 | Claude Sonnet |
| Create Basics / When&Where / Theme / Preview | 03–05 | Claude Sonnet |
| Event Details / Guests / Share | 06–08 | Claude Sonnet |
| Discover | (new) | Gemini Flash |
| Notifications feed | (new) | Gemini Flash |
| Profile & Settings | 09 | Claude Sonnet |
| Firebase rules / repos | — | Claude Sonnet |
| Asset copy / boilerplate | — | Gemini Flash |

## Asset mapping

| UI element | Repo path |
|------------|-----------|
| Onboarding heroes | `src/assets/onboarding/onboarding_0{1-4}.png` |
| Event covers | `src/assets/event-covers/*_cover.jpg` |
| Themes | `src/assets/event-themes/theme_*.png` |
| Share chrome | `src/assets/share-event/share_*.png` |
| Tab/icons | `src/assets/icons/*.svg` |
| Splash | `src/assets/splash/*` |
| Google/Apple marks | provider-native (not in pack) |

## Phases (commit + push after each)

1. Design system + tokens + assets wired — **Opus**
2. Navigation shell + bottom tab bar — **Opus**
3. Auth + Onboarding — **Opus** auth / Flash onboarding UI
4. Home — **Sonnet**
5. Create Event wizard — **Sonnet**
6. Event Details / Guests / Share + deep links `lamma.app/e/{id}` — **Sonnet**
7. Discover — **Flash**
8. Notifications feed — **Flash**
9. Profile & Settings (complete) — **Sonnet**

Reference logic only from `~/Documents/dawwar/apps/lamma` (Firebase, deep links, RSVP, drafts, brand tokens). No runtime dependency on dawwar.
