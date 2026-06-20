# Phase 15 — QA & Definition of Done

Maps spec §9 (Checklist de Qualidade) onto the React PWA + the new-feature
privacy/expiry/eligibility/key-safety/CPF checks from the migration plan.

Legend: ✅ verified · 🟡 implemented, needs on-device confirmation · ⬜ manual/device-matrix

## Automated gates (run on every change)

| Gate | Command | Status |
| --- | --- | --- |
| Unit/logic/component tests | `npm run test:run` | ✅ 54 passing (10 files) |
| Typecheck (app + api) | `tsc -p tsconfig.app.json` / `tsc -p api/tsconfig.json` | ✅ no errors |
| Production build + PWA | `npm run build` | ✅ `dist/` + `sw.js` emitted |
| Secret-leak check | `grep -r GEMMA_API_KEY dist/assets` | ✅ clean (no key in bundle) |
| Lint | `npm run lint` | 🟡 touched files clean; 8 **pre-existing** errors remain (see below) |

### Known lint debt (pre-existing, not introduced here)

- `ranking/RankingScreen.tsx` — `set-state-in-effect`, unused `displayList`
- `roulette/RouletteScreen.tsx` / `search/SearchScreen.tsx` — `@typescript-eslint/no-explicit-any`
- `review/ReviewFlowScreen.tsx` — React-Hook-Form `watch()` compiler warnings

These don't affect runtime (build is green) and live in files outside this
change set; flagged here for a follow-up cleanup.

## Spec §9 — Definition of Done (web mapping)

- ✅ **Offline** — TanStack Query persisted to storage + Workbox SW precache; cached feed renders on reload offline.
- ✅ **Loading / Empty / Error states** — every screen scaffolded with all three (skeletons + empty/error blocks).
- 🟡 **Gesture nav** — browser/Android back works via React Router; Stories use tap hotspots. Confirm on device.
- ✅ **Dark theme default & consistent** — `#0F0F0F` base tokens; no light mode path.
- ✅ **No English visible** — all copy via `src/copy/pt-BR.ts`; new strings (state/city, stories) in pt-BR.
- ✅ **Natural slang** — preserved tone ("Bota teu CPF…", "Lançar Story 🚀", "Achamos você em …").
- ✅ **Images: placeholder + error handling** — `LazyImage` with fallback for all remote images.
- 🟡 **Bottom sheet + keyboard** — Radix sheets are keyboard-safe; confirm composer inputs on device.
- ✅ **Scroll performance** — route code-split + lazy images; rails use horizontal overflow.
- 🟡 **Accessibility** — aria-labels on nav/actions, ≥44px targets. Run Lighthouse a11y on device.

## New-feature DoD checks

- ✅ **Illness privacy** — reporter id served only via `public_illness_reports` view; RLS keeps `reporter_user_id` non-selectable.
- ✅ **Story 24h expiry** — read filters `expires_at > now()`; **hard cleanup** added (`/api/cron/cleanup-expired` daily + `cleanup_expired_content()` SQL + optional pg_cron) so the DB/Storage don't grow.
- ✅ **Duel eligibility** — same-cuisine within 30 days only (unit-tested).
- ✅ **AI key safety** — `GEMMA_API_KEY` server-only; verified absent from `dist/assets`; all AI via JWT-authed `/api/ai/*`.
- ✅ **CPF gate** — checksum-validated at onboarding/signup before entry.

## Fixes shipped this pass (reported issues)

- ✅ **State → City selection** — `LocationPicker` (all 27 UFs + IBGE city typeahead + reverse-geocode "use my location"); stored as `defaultCity` + `defaultState`.
- ✅ **Stories "Postar"** — now opens the composer (`/stories?compose=1`) instead of the viewer.
- ✅ **Stories expire + DB cleanup** — read-side filter (already) + daily DB/Storage cleanup cron.
- ✅ **Date not updating** — review draft no longer persists `visitDate`; re-seeded to today on every load/reset (unit-tested).
- ✅ **Reviews/Stories not posting** — root cause was no auth session (RLS blocks `auth.uid()`-gated writes). App is now gated behind Supabase Auth → onboarding → app; logout signs out properly.

## Manual device matrix (to run before store submission)

- ⬜ Android Chrome — install A2HS, post review (appears in feed + profile), post story, expire check next day
- ⬜ iOS Safari — install standalone, same flows
- ⬜ Lighthouse — PWA installable + a11y ≥ 90
- ⬜ `npx cap sync` + Android Studio run from the same `dist/`
