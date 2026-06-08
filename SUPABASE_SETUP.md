# Supabase Setup — Rango Social (Phase 12)

This is the runbook for wiring the app to your real Supabase backend. I write all the
code and SQL; **you** run the steps marked **▶ You do this** (creating tables, seeding,
dashboard config) because they need your project's privileged access, which I don't have.

Your project: `https://nlgqejyygyszmettdxiz.supabase.co` (ref `nlgqejyygyszmettdxiz`).

> Anything in `< >` is a placeholder you replace. Run all terminal commands from the
> repo root: `/home/hugo_souto/Stuff/Personal/Guru-dos-Restaurantes`.

---

## 0. The three keys, and which are secret

| Credential | Where it's used | Secret? |
|---|---|---|
| **Project URL** | client (`VITE_SUPABASE_URL`) | No — public |
| **anon / publishable key** (`sb_publishable_…`) | client (`VITE_SUPABASE_ANON_KEY`) | No — public-safe; **RLS** is what protects data |
| **service_role key** | seed script only, server-side | **YES — never commit, never in `VITE_*`, never in chat** |
| **DB password** | optional `psql` / direct connection | **YES — never commit** |

The anon key being public is by design — it can only do what Row-Level Security (RLS)
policies allow. The whole security model is the SQL in `supabase/schema.sql`. The
`service_role` key bypasses RLS, so it's used **only** by the local seed script and must
never reach the browser bundle or git.

> All of `.env`, `.env.local`, `*.env` are already gitignored — verify with
> `git check-ignore .env.local` (should print the filename).

---

## 1. ▶ Get your keys

In the Supabase dashboard for project `nlgqejyygyszmettdxiz`:

1. **Settings → API**
   - `Project URL` → already known.
   - `Project API keys → anon / public` → you already shared this (`sb_publishable_…`).
   - `Project API keys → service_role` → click **Reveal**, copy it (for seeding only).
2. **Settings → Database → Connection string** (optional, only if you prefer `psql`):
   - Copy the URI and substitute your DB password for `[YOUR-PASSWORD]`.

---

## 2. ▶ Create `.env.local`

Create `/home/hugo_souto/Stuff/Personal/Guru-dos-Restaurantes/.env.local` (gitignored):

```bash
# --- Client (safe to ship in the bundle) ---
VITE_SUPABASE_URL=https://nlgqejyygyszmettdxiz.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_87jFn9APp52lD6UgJgQkBg_VGAZrcaU

# Flip the app from in-memory mock data to Supabase
VITE_DATA_SOURCE=supabase

# --- Seed script ONLY (server-side, secret — never committed, never VITE_) ---
SUPABASE_SERVICE_ROLE_KEY=<paste the service_role key from step 1>
```

> ✅ This file is already created with the URL + anon key filled in; you've added the
> `service_role` line. It's gitignored.

Keep `.env.example` (committed) as the documented template; it holds names only, no real
values. Tests always run on mock data regardless of `.env.local` (forced in
`vite.config.ts`), so flipping to `supabase` won't break `npm test`.

---

## 3. ▶ Create the schema (tables + RLS + storage + triggers)

This is the security backbone. **Run it once.**

**Option A — Supabase SQL Editor (simplest):**
1. Dashboard → **SQL Editor → New query**.
2. Open `supabase/schema.sql` from this repo, copy the whole file, paste, **Run**.
3. It should finish with no errors. Re-running is safe (it's written idempotently with
   `drop … if exists` / `create … if not exists`).

**Option B — psql / direct connection:**
```bash
psql "postgresql://postgres:<YOUR-PASSWORD>@db.nlgqejyygyszmettdxiz.supabase.co:5432/postgres" \
  -f supabase/schema.sql
```

What `schema.sql` sets up:
- A table for every domain model (users, restaurants, reviews, comments, review_likes,
  vibe_checks, follows, groups, group_members, custom_lists, list_items, notifications,
  stories, illness_reports, restaurant_duels, cuisine_elos, ai_user_profiles,
  ai_chat_messages).
- **RLS on every table**, default-deny, with explicit policies.
- **Illness privacy (the Phase 10/15 hard requirement):** clients can `INSERT` their own
  reports and `SELECT` only *their own* rows (for the 30-day guard). The public
  list/counts come from a `public_illness_reports` **view** and a
  `restaurant_illness_summary` view that **never expose `reporter_user_id`**. A trigger
  keeps each restaurant's `illness_reports_90d` / `illness_warning` in sync.
- **Storage buckets** `review-photos`, `menu-photos`, `avatars`, `story-photos` (public
  read; authenticated write to your own folder) with policies.
- A `handle_new_user()` trigger that creates a `public.users` row (with CPF) whenever
  someone signs up via Supabase Auth.

---

## 4. ▶ Configure Auth (email + redirect URLs)

Dashboard → **Authentication**:

1. **Providers → Email**: enable. For easiest local testing, you can turn **Confirm
   email** off while developing (turn it back on for production).
2. **URL Configuration**:
   - **Site URL**: `http://localhost:5173`
   - **Redirect URLs** (add each): `http://localhost:5173/**` and, later, your Vercel
     domain, e.g. `https://<your-app>.vercel.app/**`.
3. (Optional) **Providers → Google/Apple/etc.** if you want OAuth — add the same redirect
   URLs.

**CORS:** Supabase's REST/Auth/Storage endpoints allow all origins by default, so there's
no separate CORS allowlist to maintain — the Auth **redirect URLs** above are the thing
that actually needs to match each environment. If you ever see a CORS error it's almost
always a wrong/missing redirect URL or a typo'd project URL.

---

## 5. ▶ Seed the database from the mock fixtures

This loads the users/influencers, restaurants, reviews, comments, groups, group members,
custom lists, vibe checks, and notifications from the mock fixtures so the feed looks
populated.

The seed uses the **service_role** key (it must bypass RLS to insert other users' data),
so it runs locally, never in the browser. `tsx` is already in `devDependencies`.

```bash
# make sure SUPABASE_SERVICE_ROLE_KEY is set in .env.local (step 2), then:
npm run seed          # → tsx scripts/seed-supabase.ts
```

The script is **idempotent** — it upserts by primary key, so you can re-run it safely. It
prints a per-table summary at the end.

> **Not seeded:** stories, illness reports, duels/ELO, and AI profiles — these aren't in
> the fixtures and are created at runtime once you're signed in. `review_likes` is skipped
> on purpose too: inserting it would fire the like-sync trigger and inflate the curated
> fixture like counts.
>
> Seeding creates restaurant/review/etc. rows owned by mock user ids. Real auth users you
> create later are separate; the mock current user (`u_me`) exists as a row so the app has
> something to show before you sign up.

---

## 6. Run the app on real data

```bash
npm run dev
```

With `VITE_DATA_SOURCE=supabase` in `.env.local`, the app now reads/writes Supabase
instead of the in-memory mock. To go back to mock at any time, set
`VITE_DATA_SOURCE=mock` (or remove the line) and restart the dev server.

Browsing is public (RLS allows public reads), so the feed works signed-out. To **post**
(reviews, vibe checks, lists, illness reports, etc.) you must sign in: open
`http://localhost:5173/auth` to create an account or log in. Sign-up captures username,
display name, and an optional CPF; the `handle_new_user` trigger writes the matching
`public.users` row with the CPF (and its validity) from the sign-up metadata.

---

## 7. ✅ Verify (Phase 12 Definition of Done)

- [ ] **Runs identically on real data** — feed, ranking, restaurant detail, profile all
      populate from Supabase (no console errors).
- [ ] **Auth + CPF persist** — sign up with a CPF, refresh, sign back in; the CPF is still
      on your profile (`select cpf from public.users where id = auth.uid()`).
- [ ] **Uploads work** — posting a review photo / story photo lands in the right Storage
      bucket and renders back.
- [ ] **No CORS errors** in the browser console.
- [ ] **Illness reporter is NOT leak-able** — confirm in the SQL Editor:
  ```sql
  -- As the anon role, this must error or return nothing useful:
  set role anon;
  select reporter_user_id from public.illness_reports;   -- expect: permission denied / 0 rows
  select * from public.public_illness_reports limit 5;    -- expect: rows WITHOUT reporter_user_id
  reset role;
  ```
  In the app, `getIllnessReportsByRestaurant` returns objects with **no**
  `reporterUserId` field.

---

## 7.5 Phase 13 — AI agent (Gemma) on serverless

The AI chat is **not** in the client bundle — it's two Vercel serverless functions under
`api/ai/` so the `GEMMA_API_KEY` stays server-side. The browser only sends the user's
Supabase access token; the function reads that user's own data (RLS-enforced), calls
Gemma, and returns text.

| File | What it does |
|---|---|
| `api/ai/chat.ts` | `POST` — verifies the JWT, rate-limits per user, loads the user's **own + liked reviews + profile**, calls Gemma, persists and returns the reply. |
| `api/ai/refresh-profiles.ts` | Weekly **Vercel Cron** (`Mon 06:00 UTC`, see `vercel.json`) — regenerates `ai_user_profiles.markdown` for users active in the last 7 days. |
| `api/_lib/*` | Shared helpers (Supabase clients, Gemma call, taste-context builder, persona prompts, rate limiter). |

**Guardrails baked in:**
- The persona prompt forbids inventing restaurants — it recommends **only** from the
  user's own/liked reviews (text only). No match → it says so honestly.
- `chat.ts` only ever uses a **user-scoped** Supabase client (RLS), so it can't read
  anyone else's data. Only the cron uses the service_role key.
- Rate limit: max 15 user messages/minute (counted from `ai_chat_messages`).

**▶ You do this:**
1. **Get a key** at Google AI Studio → *Get API key* (Generative Language API). Put it in
   `.env.local` as `GEMMA_API_KEY=…` (no `VITE_`). Optionally set `GEMMA_MODEL`.
2. **Test locally** — plain `npm run dev` (Vite) does **not** run `/api`. Use the Vercel
   CLI: `npx vercel dev` (it serves the app *and* the functions, reading `.env.local`).
   Without a key, the chat falls back to a built-in canned reply so the UI still works.
3. **Rotate** the key if it's ever shared. Set `CRON_SECRET` (any random string) so only
   Vercel Cron can trigger the weekly refresh.

> The `gemma-4-26b-a4b-it` model id comes from the migration plan; if Google names it
> differently for your account, just set `GEMMA_MODEL` — no code change needed.

**Verify (Phase 13 DoD):**
- [ ] Chat recommends from your own/liked reviews (post a couple, then ask the agent).
- [ ] `GEMMA_API_KEY` / `service_role` absent from the client bundle
      (`grep -r generativelanguage dist/` → nothing).
- [ ] Weekly cron updates only last-7-day-active users
      (`curl -H "Authorization: Bearer $CRON_SECRET" .../api/ai/refresh-profiles` → JSON
      `{ updated, skipped, failed }`).

---

## 8. ▶ Production (Vercel) env vars

In Vercel → Project → **Settings → Environment Variables**:

| Name | Value | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | your project URL | Production + Preview |
| `VITE_SUPABASE_ANON_KEY` | anon key | Production + Preview |
| `VITE_DATA_SOURCE` | `supabase` | Production + Preview |
| `GEMMA_API_KEY` | your Google Generative Language API key | Phase 13 — server-only, **no `VITE_`** |
| `GEMMA_MODEL` | `gemma-4-26b-a4b-it` (optional override) | Phase 13 — server-only |
| `CRON_SECRET` | a random string | Phase 13 — protects the weekly cron |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key | Phase 13 cron only — **never `VITE_`** |

The cron (`/api/ai/refresh-profiles`) uses the **service_role** key to read many users'
taste data, so unlike Phase 12 it *does* need to be in Vercel — but server-only, never
`VITE_`-prefixed. Then add your Vercel domain to the Auth **Redirect URLs** (step 4).

---

## Security checklist

- [ ] `service_role` key and DB password live only in `.env.local` (gitignored) — never
      committed, never `VITE_`-prefixed.
- [ ] If a `service_role` key or DB password is ever pasted somewhere shared, **rotate it**
      (Dashboard → Settings → API / Database).
- [ ] The anon key is fine in the bundle; data safety comes entirely from the RLS policies
      in `supabase/schema.sql` — review them before going live with real users.
- [ ] `GEMMA_API_KEY` stays server-side (Phase 13), never `VITE_`.

---

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| `relation "public.x" does not exist` | `schema.sql` wasn't run (step 3) or failed midway — re-run it. |
| Auth redirect bounces to a blank page | Redirect URL not added in step 4. |
| `new row violates row-level security policy` | You're writing while signed out, or a policy expects `auth.uid()` — sign in first; for bulk inserts use the seed script (service_role). |
| Seed fails with `permission denied` | `SUPABASE_SERVICE_ROLE_KEY` missing/wrong in env. |
| App still shows mock data | `VITE_DATA_SOURCE` not `supabase`, or dev server not restarted after editing `.env.local`. |
| Photos 404 after upload | Buckets/policies missing — re-run `schema.sql`; confirm buckets exist under Storage. |
