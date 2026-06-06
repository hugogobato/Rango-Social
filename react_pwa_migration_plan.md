# Rango Social — React PWA + Capacitor Migration Plan (Path A)

**From:** Native Android (Kotlin + Jetpack Compose) — `Guru dos Restaurantes`
**To:** React Web PWA (Vite + TypeScript) → later wrapped with Capacitor for iOS/Android stores — `Rango Social`
**Source of truth for product/features:** `rango_social_app_spec_v2.md`
**Date:** 2026-06-06

---

## 0. Reality check & decisions

### 0.1 What we actually have today
- A **fully built native Android app**: Kotlin + Jetpack Compose, **~12,700 LOC across 152 files**, implementing all 8 phases of the original `claude_code_implementation_plan_en.md`.
- Clean Architecture (`domain` / `data` / `presentation`), Hilt DI, Room, DataStore, mock repositories, a 618-line `MockData.kt`, and the full pt-BR slang glossary in `strings.xml`.
- App id `com.gurudosrestaurantes`, name "Guru dos Restaurantes", `Logo.png` 1024×1024.

### 0.2 The hard truth about Path A
**None of the Kotlin/Compose UI runs in a browser.** React Web + Capacitor is a **frontend rewrite in React/TypeScript** — there is *zero* direct code reuse from the Compose layer.

**What *does* port (high-value, low-friction):**
| Kotlin asset | React/TS target |
|---|---|
| `domain/model/*.kt` data classes & enums | `src/domain/models/*.ts` interfaces & enums (≈1:1) |
| `domain/usecase/*` business logic (ranking, hype, streak, feed, mandatory-metrics) | `src/domain/logic/*.ts` **pure functions** (≈1:1) |
| `domain/repository/*.kt` interfaces | `src/domain/repositories/*.ts` TS interfaces |
| `data/mock/MockData.kt` (618 lines) | `src/data/mock/fixtures/*.ts` |
| `res/values/strings.xml` glossary | `src/copy/pt-BR.ts` (typed copy module) |
| Theme `Color.kt` / `Shape.kt` / `Type.kt` | Tailwind tokens + CSS variables |
| Screen flows & component anatomy | React feature folders (re-implemented) |

So the migration is **"re-skin in React, reuse the brain."**

### 0.3 Confirmed decisions
| Decision | Choice |
|---|---|
| App name / branding | **Rango Social** (logo from `Logo.png`) |
| Capacitor app id | **`com.rangosocial.app`** |
| Hosting | **Vercel** (PWA + serverless functions + Cron) |
| Locale | **pt-BR only** → typed `src/copy/pt-BR.ts` (no i18next) |
| UI stack | **Tailwind CSS + shadcn/ui** (Radix primitives) |
| Backend (real-data phase) | **Supabase** (Postgres + Auth + Storage + Realtime) |
| AI model / access | **`gemma-4-26b-a4b-it` via the Google Generative Language API**, called only through a **Vercel serverless proxy** (key never in the client) |
| Existing Android app | **Preserve on a new git branch `Android_App`**; `main` becomes the React app |
| Sequencing | **Foundation-complete first** (design system + models + nav + all screen scaffolds) before deepening features |

### 0.4 New-feature decisions (this session)
| Feature | Decision |
|---|---|
| 1. CPF (anti-bot) | Collected at onboarding; masked input + client-side **CPF checksum** validation to look legit; **no real external check** (bluff); stored on profile |
| 2. Anonymous illness report | **Aggregated warning after a threshold** — reporter always hidden; restaurant shows a discreet `⚠️ N relatos (últimos 90 dias)` only once ≥ N reports |
| 3. Restaurant Duel | Comparative-question game that **feeds a per-cuisine ELO ranking** (e.g., "melhor sushi") |
| 4. "Quanto gastou" | Collect **total spent + party size**, display **R$ X/pessoa** |
| 5. AI agent | **Conversational chat screen** (restaurant finder) using `gemma-4-26b-a4b-it`; context = user's reviews + liked reviews (**text only**); maintains a **per-user markdown profile** in Supabase, refreshed **weekly for active users** via Cron |
| 6. Stories | **Separate Instagram-style Stories**, **photo only**, **24h** expiry, own rail (distinct from 4h Vibe Checks) |

### 0.5 Notes still to confirm during build (non-blocking)
- Exact Google model id casing/endpoint for `gemma-4-26b-a4b-it` (verified at integration time).
- **Rotate the AI key** after the proxy is wired (it has been pasted into chat + a repo file).
- Cuisine-ELO **scope**: default **global per-cuisine** + a "dentro do meu bonde" view (confirm if you want group-scoped only).

---

## 1. Target architecture

### 1.1 Tech stack
| Concern | Choice | Why |
|---|---|---|
| Build/dev | **Vite + React 18 + TypeScript** | Fastest DX; `dist/` is exactly what `npx cap sync` and static hosts want |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix) | Full control of the slang aesthetic; tiny bundle; accessible primitives for Sheets/Dialogs/Tabs/Slider |
| Icons | **lucide-react** | Pairs with shadcn |
| Routing | **React Router v6** (`createBrowserRouter`) | SPA routing that works as PWA and inside Capacitor |
| Server state | **TanStack Query** | Caching, loading/error states, offline persistence; swap mock→Supabase behind the same hooks |
| Client/UI state | **Zustand** | Lightweight session/UI/review-draft state |
| Forms/validation | **React Hook Form + Zod** | Multi-step review flow, mandatory metrics, CPF field |
| Maps | **Leaflet + react-leaflet** (OSM tiles) | Web-native equivalent of OSMDroid; free |
| Animation | **Framer Motion** + **canvas-confetti** | Page transitions, micro-interactions, "Lançar a braba" confetti, duel reveal |
| Images | native `<img loading="lazy">` + wrapper | Coil equivalent; `picsum.photos` / `placehold.co` for mock |
| Stories/share render | **html-to-image** | Story composer overlays + 9:16 shareable review cards |
| PWA | **vite-plugin-pwa** (Workbox) + **@vite-pwa/assets-generator** | Manifest, service worker, icon/splash generation |
| Native wrap | **Capacitor** + plugins (Geolocation, Camera, Preferences, Share, Status Bar, Splash) | iOS/Android packaging from the same `dist/` |
| Backend | **Supabase** (`@supabase/supabase-js`) | Auth/DB/Storage/Realtime; CORS-friendly; anon key safe with RLS |
| **Serverless / AI proxy** | **Vercel Functions** (`/api/*`) + **Vercel Cron** | Holds `GEMMA_API_KEY` server-side; weekly AI-profile refresh |
| **AI** | **Google Generative Language API** · `gemma-4-26b-a4b-it` | Restaurant-finder agent + weekly profile summarization |
| CPF / ELO | small **custom utils** (`cpf.ts` checksum, `elo.ts`) | No deps needed |
| Offline KV | **@capacitor/preferences** (native) / `localStorage` (web) | DataStore equivalent |
| Testing | **Vitest + React Testing Library** (+ Playwright later) | Unit logic + component + flows |
| Lint/format | ESLint + Prettier (+ optional Husky/lint-staged) | Consistency |

### 1.2 Folder structure (Clean Architecture mapping)
```
api/                  # Vercel serverless functions (AI proxy, cron)  [server-side only]
  ai/chat.ts          #   authenticated Gemma chat proxy
  ai/refresh-profiles.ts  # weekly Cron: regenerate active users' markdown profiles
src/
  app/                # providers, router, theme, AppShell (bottom nav + central FAB)
  domain/
    models/           # TS interfaces & enums (+ Story, IllnessReport, Duel, Elo, AiProfile)
    logic/            # pure fns: ranking, hype, streak, feed, metrics-union, elo, cpf
    repositories/     # repository interfaces (TS types)
  data/
    mock/             # mock repo impls + fixtures (port of MockData.kt)
    supabase/         # supabase repo impls (Phase 12) + client
    repositoryProvider.ts   # env-flag chooses mock vs supabase
  features/           # presentation, mirrors Compose packages + new features
    home/ ranking/ review/ profile/ groups/ lists/ map/
    notifications/ onboarding/ search/ roulette/ vibecheck/ share/
    restaurant/ badges/ settings/
    stories/          # NEW: Instagram-style 24h photo stories
    illness/          # NEW: anonymous illness report flow + restaurant warning
    duel/             # NEW: restaurant duel game + cuisine ELO leaderboard
    ai/               # NEW: AI agent chat screen
  components/ui/       # shadcn components
  components/shared/   # ReviewCard, MetricSlider, StoriesRail, Pepper rating, etc.
  lib/
    platform/         # native API abstraction: geolocation, camera, storage, share
    ai/               # client-side AI hooks (call /api/ai/*, never the key)
    query/            # QueryClient + persistence
    utils/
  copy/               # pt-BR.ts glossary (typed)
  styles/             # globals.css, tailwind tokens
public/               # icons, splashes, manifest assets, Logo
```

### 1.3 Native API fallback strategy (Message §4)
A single `src/lib/platform/` layer; the app **never** calls a native or web API directly.
```
geolocation.ts → @capacitor/geolocation  | navigator.geolocation
camera.ts      → @capacitor/camera        | <input type=file accept=image/* capture> / File API
storage.ts     → @capacitor/preferences   | localStorage / IndexedDB
share.ts       → @capacitor/share         | navigator.share → clipboard fallback
```

### 1.4 Build-output compatibility (Message §2)
- **Static SPA only** (no SSR) → `dist/` is both a deployable PWA root *and* the Capacitor `webDir`.
- `capacitor.config.ts`: `{ webDir: 'dist', appId: 'com.rangosocial.app', appName: 'Rango Social' }`.
- **Service worker registered on web only** (`!Capacitor.isNativePlatform()`) — avoids cache conflicts on native.
- Vercel hosts both the static PWA and the `/api/*` serverless functions from one project.

### 1.5 Env vars, secrets, backend & CORS (Message §5)
- Vite exposes only `VITE_*` to the client. Supabase **URL + anon key are public-safe** (RLS enforces access).
- **`GEMMA_API_KEY` is a Vercel server env var — NEVER `VITE_`, never in the bundle.** All AI calls go through `/api/ai/*`, which authenticates the Supabase user (JWT) before calling Gemma (prevents key abuse).
- `.env` is **gitignored**; the raw key currently in `.env` gets a proper name and moves to Vercel project settings; **rotate it** post-wiring.
- `.env.local` (gitignored) for dev secrets; `.env.example` committed (names only).
- CORS: configure Supabase **allowed origins + auth redirect URLs** for localhost + the Vercel domain; Storage buckets get explicit RLS policies.

### 1.6 New-feature specs & data-model additions

**Model additions / changes (`src/domain/models`):**
```ts
User         += cpf: string; cpfValid: boolean   // bluff; checksum-validated, not externally verified
Review       += totalSpent?: number; partySize?: number   // UI shows totalSpent / partySize = R$/pessoa
Restaurant   += illnessReports90d: number; illnessWarning: boolean; eloByCuisine: Record<Cuisine, number>

Story          { id; userId; user?; restaurantId?; restaurant?; photoUrl; caption?;
                 createdAt; expiresAt /* +24h */; viewers: string[] }
IllnessReport  { id; restaurantId; reporterUserId /* internal, never exposed */;
                 symptom: IllnessSymptom; note?; mealDate; createdAt }   // always anonymous
RestaurantDuel { id; userId; cuisine; aId; bId; questions: DuelQuestion[];
                 winnerId; createdAt }
DuelQuestion   { aspect: MetricId; prompt: string; chosenId: string }
CuisineElo     { restaurantId; cuisine; rating /* default 1000 */; duels: number }
AiUserProfile  { userId; markdown: string; updatedAt; version }
AiChatMessage  { id; userId; role: 'user'|'assistant'; content; createdAt }
enum IllnessSymptom { INTOXICACAO, DIARREIA, VOMITO, MAL_ESTAR, OUTRO }
```

**1) CPF anti-bot** — Onboarding step: masked `000.000.000-00` input, `cpf.ts` checksum (the real 2-digit verifier algorithm) so invalid CPFs are rejected and it *feels* real; accepted CPFs are stored on the profile. No registry/Receita call. Copy stays in-tone (e.g., "Bota teu CPF pra provar que não é robô 🤖").

**2) Anonymous illness report** — Entry on the restaurant detail screen ("Passei mal aqui 🤢"). Submits symptom + optional note + meal date. `reporterUserId` is stored server-side **only** for rate-limiting/abuse (one report per user per restaurant per 30 days) and is **never** exposed in any API response. Aggregation logic: count reports in last 90 days; when `count >= THRESHOLD` (default 3), restaurant shows `⚠️ N relatos de mal-estar (90 dias)`. Below threshold → nothing public.

**3) Restaurant Duel + cuisine ELO** —
- *Trigger detection* (`duel/`): when the user logs/reviews a restaurant of cuisine C and has another C visit within the last **30 days**, surface "Bora um duelo? 🥊 A vs B".
- *Questions*: generated from the metrics both reviews share (e.g., `SABOR`, `ATENDIMENTO`, `CUSTO_BENEFICIO`) → "Quem mandou melhor no sabor?". 3–5 questions.
- *Result*: each answer is a head-to-head; aggregate winner updates **per-cuisine ELO** (`elo.ts`, K-factor ~32, base 1000) for both restaurants → drives a "Top sushi / Top pizza" leaderboard (global, + a "no meu bonde" view). Shareable recap card.

**4) R$/pessoa** — Review media step replaces single "valor gasto" with **total + nº de pessoas** (defaults nº from companions+1); feed/card render `R$ {total/partySize}/pessoa` (rounded). Back-compat: if only total exists, partySize defaults to 1.

**5) AI agent (Gemma)** —
- *UI* (`features/ai`): chat screen reachable from Search and from the Roulette area ("Prefere que a IA escolha? 🤖"). Streams/returns **text only**.
- *Server* (`api/ai/chat.ts`): verifies Supabase JWT → loads the user's reviews + liked reviews (text only, no images) + their `AiUserProfile.markdown` → builds the prompt → calls `gemma-4-26b-a4b-it` via Google API → returns text. Key stays server-side.
- *Per-user profile*: `api/ai/refresh-profiles.ts` runs on **Vercel Cron weekly**; for each user **active in the last 7 days**, it summarizes recent activity into/updating `AiUserProfile.markdown` (taste, budget, favorite cuisines, no-gos) via Gemma, stored in Supabase. The chat also nudges the profile after notable sessions.

**6) Stories (Instagram-style)** — `features/stories`: composer (photo via `platform/camera` + caption + optional restaurant tag), 24h expiry, **separate rail** above the Vibe-Checks rail on Home (gradient ring = unseen). Viewer = tap-through full-screen with progress bars, viewer list for the author. Distinct from Vibe Checks (which stay 4h status posts). Media → Supabase Storage in the backend phase; mock URLs before that.

---

## 2. Phased execution plan

> One phase at a time; verify before advancing. **Phase 4 is the "foundation-complete" gate** (full design system + all models + complete nav + every screen scaffolded). Each phase: **Objective → Tasks → Deliverable/Verify**.

### Phase 0 — Repo pivot & history preservation
- Commit/clean working tree (staged `:Zone.Identifier` deletion + `Message_Claude.md`).
- Create & push branch **`Android_App`** from current `main` (Kotlin app preserved there).
- On `main`: remove Android-only root artifacts (`app/`, `gradle/`, `*.gradle.kts`, `gradle.properties`, `local.properties`, `.gradle/`, gradle bits of `.idea/`). Recoverable via the branch.
- Keep at root: `Logo.png`, `LICENSE`, `rango_social_app_spec_v2.md`, `claude_code_implementation_plan_en.md`, `Message_Claude.md`, this plan.
- New Node/Vite/Capacitor **`.gitignore`** that **excludes `.env`**.
- **Verify:** `Android_App` branch exists; `main` clean and ready to scaffold.

### Phase 1 — Tooling & project foundation
- Vite (react-ts) at root; path aliases (`@/*`); Tailwind + shadcn/ui init; ESLint+Prettier; Vitest+RTL.
- Folder structure from §1.2; base providers (QueryClient, Router, theme); `.env.example`; npm scripts.
- **Verify:** `dev`/`build`/`lint`/`test` all run; `dist/` emitted.

### Phase 2 — Rebrand, design system & PWA shell
- Tokens → tailwind config + CSS vars (bg `#0F0F0F`, surface `#242424`, primary `#FF6B35`, secondary `#7B61FF`, accent `#00D9C0`, error `#FF453A`, text `#FFFFFF`/`#A0A0A0`; radii card 16 / button pill / chip 8 / sheet-top 24; type scale).
- Rebrand "Rango Social" (title/meta/copy welcome); favicon + PWA icons + iOS splash from `Logo.png` (`@vite-pwa/assets-generator`).
- Manifest (standalone, portrait, theme/bg `#0F0F0F`, icons, screenshots) + iOS meta; service worker (web-only).
- App shell: bottom nav (🏠🏆 ➕ 🔔👤) with elevated glowing central FAB; safe areas.
- Core shadcn primitives (pill Button, Card, Sheet, Dialog, Tabs, Chip, Slider, Avatar, Badge, Skeleton, Toast).
- Copy module `src/copy/pt-BR.ts` (port `strings.xml`).
- **Verify:** Lighthouse = installable; A2HS works on Android Chrome + iOS Safari.

### Phase 3 — Domain models, business logic & mock data
- Models (incl. **new**: Story, IllnessReport, RestaurantDuel, DuelQuestion, CuisineElo, AiUserProfile, AiChatMessage; **changes**: User.cpf, Review.partySize, Restaurant illness/elo fields).
- Logic (pure + unit-tested): ranking, hype, streak, feed, mandatory-metrics union, **`elo.ts`**, **`cpf.ts`**, illness-threshold aggregation.
- Repository interfaces (incl. Story/Illness/Duel/Elo/AiProfile).
- Mock fixtures ported from `MockData.kt` (30 SP + 30 Ribeirão restaurants, 8 influencers+reviews, 3 groups, 5 lists, vibe checks, notifications, sample stories/duels/illness).
- Mock repos + `repositoryProvider.ts` (`VITE_DATA_SOURCE=mock|supabase`); TanStack Query hooks.
- **Verify:** Vitest green (incl. ELO & CPF); scratch page renders mock data via hooks.

### Phase 4 — Navigation graph & all screen scaffolds  ⟵ FOUNDATION-COMPLETE GATE
- Routes mirroring `Route.kt` **+ new**: `Stories`, `Duel`/`DuelLeaderboard`, `AiAgent`, restaurant `IllnessReport` entry, `Settings`, `Badges`.
- Every screen scaffolded with header + Loading/Empty/Error, wired to mock hooks (interactions may be stubbed).
- **Onboarding** (welcome → style → city → follow) **+ CPF step**; persist `hasCompletedOnboarding`; mock session.
- **Verify:** every route reachable; onboarding (incl. CPF checksum) completes & is remembered; back/gesture nav works.

### Phase 5 — Feed & social interactions
- Home feed (virtualized), **Vibe-Checks rail** + **Stories rail** placeholder, "Recomendado pra vc".
- **ReviewCard** full (peppers, photos, footer with **R$/pessoa**, like double-tap, comment sheet/threads, save, share entry).
- Search + Advanced Filters sheet; Notifications grouped + swipe; comments.
- **Verify:** like/comment/save mutate mock state; filters narrow results.

### Phase 6 — Review flow ("Mandar a Real")
- Multi-step (RHF+Zod, draft in Zustand): pick restaurant / "Lugar novo" form + mini-map; date+companions; destinations + dynamic mandatory-metric validation; metric sliders; comment+photos (camera/file)+receipt; **total + nº pessoas → R$/pessoa**; preview → "Lançar a braba 🚀" + confetti; partial-post snackbar.
- Capture cuisine + visit so the **Duel trigger** has data.
- **Verify:** review persists & appears in feed+groups; mandatory-metric rule per spec §7.4; per-person value correct.

### Phase 7 — Ranking, discovery & maps
- Ranking with persisted filters (city/reach/metric), medals, "Tá bombando 🔥"; Trending toggle; Map (Leaflet/OSM) pins + pulsing vibe-check pins; Roulette "🎲 Onde vou hoje?" (+ entry to AI agent as the alternative).
- **Verify:** order matches formula; filters persist; map cards open.

### Phase 8 — Profile, Groups & Lists
- Profile (own/others): stats, streak, badges, tabs (Reviews/Fotos/Vibe Checks/**Stories**/Curtidas), action grid, follow/unfollow.
- Lists (Minhas/Colaboro/Seguindo; create sheet; drag-reorder detail). Groups (list; create with mandatory metrics; detail tabs Feed/Ranking/Membros/Enquetes). Badges/stats; Settings (slang level, notifications, "Vazar").
- **Verify:** follow changes feed; reorder persists; group metrics flow into review step.

### Phase 9 — Gamification & polish
- Vibe Check create/view; Shareable Cards (9:16 via html-to-image) + Web Share; streak/badges logic; wire **all platform abstractions** + offline cache; skeletons, Framer Motion transitions, route code-split, lazy images; **full pt-BR copy audit**; accessibility (≥48px targets, aria); keyboard-safe sheets.
- **Verify:** offline reload renders cached feed; share card downloads; Lighthouse a11y+PWA ≥ 90.

### Phase 10 — New social features: Stories + Anonymous illness reports
- **Stories** (`features/stories`): composer (photo+caption+restaurant tag), 24h expiry, separate rail, full-screen viewer w/ progress + viewer list. (Mock storage now; Supabase Storage in Phase 12.)
- **Illness reports** (`features/illness`): "Passei mal aqui 🤢" flow (symptom/note/meal date), one-per-user-per-restaurant/30d guard, **threshold-aggregated public warning** on restaurant detail; reporter never exposed.
- **Verify:** stories appear/expire correctly; warning shows only at/above threshold; reporter identity never returned by any query.

### Phase 11 — Restaurant Duel + cuisine ELO
- Trigger detection (same cuisine, ≤30d), comparative-question generator from shared metrics, ELO update (`elo.ts`), duel UI with animated reveal, **per-cuisine leaderboard** (global + "no meu bonde"), shareable recap.
- **Verify:** duel only triggers when eligible; ELO updates both restaurants; leaderboard reflects results.

### Phase 12 — Backend integration (Supabase)
- Project + schema (tables for every model incl. stories/illness/duels/elo/ai_profiles) + **RLS** (esp. illness `reporterUserId` never selectable by clients); Auth (email/OAuth) **storing CPF**; Storage buckets (review/menu/avatar/**story** photos) + policies; Realtime (vibe checks, stories, notifications).
- Implement Supabase repos behind existing interfaces; flip `VITE_DATA_SOURCE=supabase`; seed from fixtures; configure CORS/redirect URLs; env in Vercel.
- **Verify:** app runs identically on real data; auth + CPF persist; uploads work; no CORS errors; illness reporter not leak-able.

### Phase 13 — AI agent (Gemma) + serverless + weekly profile
- Vercel function `api/ai/chat.ts` (JWT-auth → load reviews+liked reviews+profile → call `gemma-4-26b-a4b-it` → text); `GEMMA_API_KEY` server env; **rotate key**.
- Chat UI (`features/ai`) with history (`AiChatMessage`), entry from Search/Roulette.
- `api/ai/refresh-profiles.ts` on **Vercel Cron weekly** → regenerate `AiUserProfile.markdown` for last-7-day-active users; chat nudges profile too.
- Rate-limit the endpoint per user.
- **Verify:** agent recommends from the user's own/liked reviews (text only); key absent from client bundle; weekly cron updates only active users' profiles.

### Phase 14 — Deploy (Vercel PWA) + Capacitor native wrap
- CI build → Vercel (HTTPS, static + `/api` functions + Cron); verify install on iOS Safari + Android Chrome with friends.
- Add Capacitor (`capacitor.config.ts`, `cap add ios`+`android`, `cap sync`); native splash/icons from `Logo.png`; native perms (geo/camera); SW guarded off on native; build native shells.
- **Verify:** Lighthouse PWA pass; installed PWA standalone; Android native build runs from the same `dist/`.

### Phase 15 — QA & Definition of Done
- Map spec §9 DoD to web (offline, all-state screens, gesture nav, dark default, no English, natural slang, image placeholders, sheet+keyboard, scroll perf, a11y) + new-feature checks (illness privacy, story expiry, duel eligibility, AI key safety, CPF gate).
- Cross-device/browser matrix; Lighthouse perf/PWA/a11y.
- **Verify:** DoD fully green; friends install & use end-to-end.

---

## 3. Phase dependency map
```
0 Pivot ─▶ 1 Tooling ─▶ 2 Design+PWA ─▶ 3 Models+Logic+Mock ─▶ 4 Nav+Scaffolds (FOUNDATION GATE)
                                                                       │
   ┌───────────────────────────────────────────────────────────────────┘
   ▼
5 Feed ─▶ 6 Review ─▶ 7 Ranking/Map ─▶ 8 Profile/Groups/Lists ─▶ 9 Polish
                                                  │
          ┌───────────────────────────────────────┤ (10 & 11 buildable on mock)
          ▼                                        ▼
 10 Stories + Illness                      11 Duel + cuisine ELO
          └───────────────┬────────────────────────┘
                          ▼
                12 Supabase (real persistence for everything, incl. CPF)
                          ▼
                13 AI agent (Gemma) + serverless + weekly Cron
                          ▼
                14 Deploy (Vercel) + Capacitor ─▶ 15 QA / DoD
```
Phases 5–8 partly parallel after the gate; 10 & 11 can be built on mock before Supabase; 13 requires 12.

## 4. Risks & mitigations
| Risk | Mitigation |
|---|---|
| Underestimating the rewrite (12.7k Kotlin LOC) | Port logic/models/mock first; foundation-first keeps it deployable early |
| **AI key leakage** (PWA bundle is public) | Key only in Vercel server env; all AI via JWT-authed `/api/ai/*`; rotate key |
| iOS PWA limits (push, storage eviction) | Native push deferred to Capacitor; iOS PWA = installable shell |
| SW vs Capacitor cache conflict | Register SW web-only |
| **Illness reports weaponized / defamation** | Reporter hidden; per-user/30d guard; public only at threshold; RLS hides `reporterUserId` |
| Supabase RLS misconfig | Anon key public but RLS-locked; review policies in Phase 12; service-role key never client-side |
| CORS on hosted domain | Configure Supabase allowed origins + redirect URLs per env |
| Stories storage cost/abuse | Photo-only v1, 24h auto-expiry cleanup job, size/dimension limits |
| AI cost (weekly summaries × users) | Cron only for last-7-day-active users; cap context to text reviews; rate-limit chat |

## 5. Immediate next actions (on approval)
1. **Phase 0:** branch `Android_App`, push, strip Android root files on `main`, add Node `.gitignore` (excluding `.env`).
2. **Phase 1:** scaffold Vite React-TS + Tailwind + shadcn + providers.
3. Confirm §0.5 non-blockers (model id/casing at integration; ELO scope; plan to rotate the AI key).
