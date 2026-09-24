# Lamma Android UI + Logic Audit (no fixes)

**Date:** 2026-09-17 (Africa/Cairo)  
**Device:** DN2101 via wireless ADB `192.168.1.103:43899`  
**App:** `com.lamma` (fresh install + Guest)  
**Mirroring:** Vysor opened  
**Caps:** `Documents/lamma/qa-android/audit/caps3/`  
**Design refs:** `Documents/lamma/design-reference/`  
**Scope:** Audit only — device walk vs references. No code changes.

---

## 1. Onboarding

**Evidence:** `caps3/01_start.png` · Ref: `01_onboarding.png`

### UI issues
- Live screen is close to ref: Lamma/لمة logo, tagline, hero illustration, “Create beautiful gatherings.” / “Invite everyone. Know who's coming.”, 3 pagination dots, Continue + Sign in, EN/AR toggle.
- Hero illustration density is still lighter / softer than the contact-sheet richness in some ref exports (acceptable but not pixel-match).
- Pagination: first pill active (coral); matches intent.

### Logic issues
- Continue advances the carousel; Sign in jumps to Welcome — works.
- After reinstall, a later cold start sometimes landed directly on Welcome (onboarding skipped) — onboarding persistence / first-route behavior is inconsistent across launches.

---

## 2. Auth / Welcome (Google, Apple, guest)

**Evidence:** `caps3/B_auth_welcome.png`, `caps3/C_auth_sheet.png` · Ref: `10_social_auth_reference.png`

### UI issues
- Welcome matches ref well: L mark card, “Welcome to Lamma”, “Plan, invite and celebrate together.”, Continue as guest, Continue with Google, “No phone number. No SMS codes.”, guest upgrade note, EN/AR.
- **Apple Sign-In button is missing on Android Welcome** (expected platform limit vs iOS ref that shows Apple).
- Profile → **Sign in** opens a different sheet titled **“Edit profile”** with only **Continue with Google** — no guest CTA, no “No phone number…” copy, wrong chrome title vs body (“Sign in to Lamma”).

### Logic issues
- Continue as guest → Home works.
- Continue with Google **not E2E-verified** this pass (intentionally not completed).
- Profile Sign-in sheet has **no way to stay guest** except Back.

---

## 3. Bottom tab bar (Home / Discover / Create / Notifications / Profile)

**Evidence:** live navigation across `C_*` shots

### UI issues
- All five tabs present with active coral highlight + dot.
- Create replaces the tab shell with the full-screen wizard (tabs hidden) — intentional; Back returns to prior tab.
- None found beyond Create stack owning chrome (no label wrap observed this pass on DN2101).

### Logic issues
- Tab switches work for Home / Discover / Notifications / Profile.
- None found for routing itself.

---

## 4. Home (header, Upcoming/Hosting/Past, featured card, list, FAB)

**Evidence:** `caps3/C_home.png`, `C_home_upcoming.png`, `C_home_hosting.png`, `C_home_past.png`, `B_after_guest.png`, `Z_home.png` · Ref: `02_home.png`

### UI issues
- Header improved: Lamma/لمة + tagline + “Good evening, Guest” avatar present.
- Upcoming shows event card for “Mohamed” with date/time, Arabic location, “+1” / “1 going” — but **no left cover / featured hero art** like ref’s large image card.
- Hosting: full-screen **“Something went wrong”** error empty (pink X + Try again) instead of empty-hosting copy.
- Past: friendly empty (“No past events” / “Your memories will show up here.”) — good; dual “Create an event” (body CTA + FAB) crowds bottom.
- FAB coral “+ / Create an event” can overlap list content near the tab bar (same clash noted in older QA).

### Logic issues
- Upcoming list loads at least one event for Guest.
- **Hosting query fails** → permanent error state; Try again does not recover during session.
- Tapping the Mohamed card opens Event Details — works.
- FAB / “Create an event” opens Create wizard — works.

---

## 5. Create Event — Basics

**Evidence:** `caps3/D_basics.png`, `D_basics_filled.png` · Ref: `03_create_basics.png`

### UI issues
- Strong match: stepper 1–4 (Basics / When & where / Themes / Preview), title field, category chips, description area, live invite preview region, coral Next.
- Hierarchy still includes a **ghost Next with bounds `[0,0][0,0]`** beside a real Next (`[48,2196][1032,2245]`, area 48216).

### Logic issues
- Title + category input work (`Audit_Birthday` / `ThemePass`, Birthday selected, counter updates).
- Real Next advances to When & Where — works (fixed vs older 0×0-only Next).
- Draft autosave may still toast permission errors in some sessions (seen earlier same day); not reproduced on every publish path today.

---

## 6. Create Event — When & Where (Maps + OSM search)

**Evidence:** `caps3/E_when.png`, `E_date.png`, `E_time.png`, `E_map.png`, `E_map_search.png`, `E_confirmed_default.png` · Ref: `04_when_where.png`

### UI issues
- Layout matches: Date / Start / End rows; Venue / Area rows; Next.
- **Copy bug:** both Venue name and Area / Address use placeholder **“Pick location on the map”** before pick; after confirm both often show the **same place name/address** (e.g. ميدان التحرير duplicated) — Venue should be a short name field, Area the address.
- Map screen looks solid: Google Map (dark), search field, “Type at least 3 characters to search OpenStreetMap”, pin, coords, **Confirm location** CTA.

### Logic issues
- Date picker + OK works; Start/End defaulted to 8:00 PM–11:00 PM after date set.
- Map opens; OSM search for “Cairo” returns results but **US “Cairo” cities rank above القاهرة، مصر** — Egypt-first ranking missing.
- Confirming without search (default Cairo pin) reverse-geocodes to ميدان التحرير and returns to When & Where — works.
- Next without date/location previously **stayed on When & Where with no inline validation message** (silent block).
- Confirm button label is **“Confirm location”** (not “Confirm”) — easy to miss in automation; works when tapped.

---

## 7. Create Event — Choose Theme

**Evidence:** `caps3/F_theme_live.png`, `F_theme_final.png` · Ref: `05_choose_theme.png`

### UI issues
- Screen title “Choose a theme”; stepper shows Themes active; event summary chip (title, date, place).
- Category chips: Elegant / Party / Dinner / Travel / Minimal + **Use this theme** CTA.
- Compared to ref: theme **grid artwork / large visual cards** are weaker or less obvious in the a11y tree (need visual QA that cards show full art vs chips-only chrome). Safe-area historically buggy — not screaming broken on this capture, but art density may still lag ref.

### Logic issues
- Next from When & Where reaches Themes only after date + location set.
- **Use this theme** (not Next) is required to advance — tapping Next while still on Themes left you on Themes.
- Elegant filter + Use this theme → Preview works.

---

## 8. Create Event — Preview / Publish

**Evidence:** `caps3/G_preview_final.png`, `G_publish_final.png`

### UI issues
- Preview shows title, date/time range, full address, **Publish event** CTA; stepper on Preview.
- After publish, lands on Event Details with **“YOU'RE GOING”** banner — good.

### Logic issues
- **Publish succeeded** for Guest this session (ThemePass event opened as host/going).
- Hosting tab still errored earlier in the same session — published events may not appear under Hosting due to the Hosting query failure (see §4).

---

## 9. Event Details (including RSVP)

**Evidence:** `caps3/Z_details.png`, `G_publish_final.png` · Ref: `06_event_details.png`

### UI issues
- Cover/hero band is present but **soft-blurred** (wine-glasses bokeh) — better than blank earlier builds, still not a sharp full-bleed cover like ref.
- Host row shows avatar “H” / label **“Host”** instead of a real display name when host profile is thin.
- Grammar: **“1 people are going”** (should be “1 person is going”).
- RSVP row Going / Maybe / Can’t go visible; Open in Maps present.

### Logic issues
- Open from Home card works.
- Share icon opens Share Invite.
- See all opens Guest List (bounds healthy: `[819,2141][981,2225]`).
- RSVP tap from Share stack not re-verified after share overlay; buttons present on Details.

---

## 10. Guest List

**Evidence:** `caps3/Z_guests.png` · Ref: `07_guest_list.png`

### UI issues
- Shows filters Going / Maybe / Declined, “1 going”, Hosts (1) with Event creator — functional but **simpler than ref** (less rich guest rows/avatars).
- None found as “broken chrome”; density vs ref is lighter.

### Logic issues
- **See all works** this pass (regressed fixed vs older 0×0 See all).
- None found for basic open/list.

---

## 11. Share Invite

**Evidence:** `caps3/Z_share.png` · Ref: `08_share_invite.png`

### UI issues
- Header “Share invite” + “SPREAD LOVE · BRING PEOPLE TOGETHER” matches intent.
- Main invite card art is **heavily blurred / soft** — looks broken or low-res vs a crisp invite card in ref.
- Lower share actions (system share / copy link / etc.) not fully visible in the capture (card dominates; may need scroll).

### Logic issues
- Opens from Details share icon — works.
- Deep share actions (copy link, WhatsApp, etc.) **not fully verified** beyond screen open.

---

## 12. Discover

**Evidence:** `caps3/C_discover.png`

### UI issues
- Header/search/category chips (Birthday / Wedding / Engagement) look good.
- Body shows **Something went wrong / Try again** instead of “Happening around Egypt” cards.

### Logic issues
- Public events query fails → error empty; Try again does not recover.
- Search / category chips not verified against live results (blocked by error).

---

## 13. Notifications feed

**Evidence:** `caps3/C_notifications.png`

### UI issues
- Empty state is clean: “You're all caught up” / “Invites, RSVPs and updates will appear here.”
- No Today/Earlier sections when empty (expected); matches a proper empty, not skeletons.

### Logic issues
- Feed loads empty successfully for Guest (no permission crash UI this pass).
- None found for empty path; push/inbox with real notifications **not verified**.

---

## 14. Profile & Settings

**Evidence:** `caps3/C_profile.png`, `C_appearance.png`, `C_language.png` · Ref: `09_profile_settings.png`

### UI issues
- Strong match: Guest card, Sign in, Language, Notifications settings row, Appearance, My drafts, Saved themes, brand header.
- Appearance sheet: Light / Dark / Match system — clear.
- Language: English / العربية + restart note — clear.

### Logic issues
- Sign in → Google-only “Edit profile” sheet (see §2).
- Appearance / Language sheets open; language restart not E2E-forced.
- My drafts / Saved themes not deep-tested.

---

## Cross-cutting

- **Hosting + Discover** share a “Something went wrong” pattern while Upcoming can still show data — inconsistent query/error handling.
- Create wizard: duplicate **0×0 Next** a11y node remains.
- OSM search ranking prefers non-Egypt “Cairo” hits.
- Venue vs Area placeholder/value duplication after map confirm.
- Dev overlays (Fast Refresh / LogBox) appeared in earlier sessions; less so on this clean Guest walk after Metro via `adb reverse` + `localhost:8081`.

## Priority backlog (input for fix prompt)

1. Fix Hosting + Discover error states (Firestore rules / queries / UX copy).
2. Home featured/list **cover images**; FAB overlap.
3. When & Where placeholders + validation messages; OSM Egypt-first ranking; Venue vs Area fields.
4. Remove ghost 0×0 Next; Theme: make “Use this theme” vs Next affordance obvious.
5. Auth sheet title/parity (Edit profile vs Sign in); Apple N/A on Android OK if documented.
6. Event Details: pluralization “1 people”; sharper cover; host display name.
7. Share Invite: sharp invite art + verify share actions.
8. Confirm Hosting list updates after successful Publish.

## Caps

Primary: `Documents/lamma/qa-android/audit/caps3/`
