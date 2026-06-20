# Deploy & Native Wrap (Phase 14)

Rango Social ships as **one static `dist/`** that serves three roles:

- a **PWA** hosted on Vercel (installable on Android/iOS),
- the source for **Vercel serverless `/api/*`** functions + Cron, and
- the **Capacitor `webDir`** for native iOS/Android shells.

---

## 1. Vercel (PWA + serverless + cron)

### Environment variables (Vercel → Project → Settings → Environment Variables)

| Name | Scope | Notes |
| --- | --- | --- |
| `VITE_DATA_SOURCE` | Client | `supabase` in production |
| `VITE_SUPABASE_URL` | Client | public-safe (RLS protects data) |
| `VITE_SUPABASE_ANON_KEY` | Client | public-safe |
| `GEMMA_API_KEY` | **Server only** | never `VITE_`; rotate after first wiring |
| `GEMMA_MODEL` | Server | optional, defaults to `gemma-4-26b-a4b-it` |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | used by the cron jobs; bypasses RLS |
| `CRON_SECRET` | Server | optional; if set, Cron must send it as a Bearer token |

> ⚠️ `GEMMA_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must **never** carry the
> `VITE_` prefix — that would inline them into the public client bundle. The
> production build is verified clean (no key strings in `dist/assets`).

### Build settings

Already declared in `vercel.json`:

- `buildCommand: npm run build`, `outputDirectory: dist`, `framework: vite`
- SPA rewrite: everything except `/api/*` → `index.html`
- Functions: `api/ai/chat.ts`, `api/ai/refresh-profiles.ts`, `api/cron/cleanup-expired.ts`

### Cron jobs

| Path | Schedule | Purpose |
| --- | --- | --- |
| `/api/ai/refresh-profiles` | `0 6 * * 1` (weekly) | regenerate AI taste profiles for last-7-day-active users |
| `/api/cron/cleanup-expired` | `0 4 * * *` (daily) | hard-delete expired Stories (24h) + Vibe Checks (4h) from DB + Storage |

> Vercel **Hobby** runs crons about once/day, so the cleanup is scheduled daily.
> Expired content is already hidden on read (`expires_at > now()`); the cron is
> purely about reclaiming rows/photos. For more frequent cleanup, enable the
> optional `pg_cron` schedule in `supabase/schema.sql`.

### Deploy

```bash
git push           # Vercel auto-builds on push, or:
npx vercel --prod  # manual production deploy
```

---

## 2. Capacitor native shells (iOS / Android)

The native plugins are already in `package.json`; `capacitor.config.ts` is set
to `appId com.rangosocial.app`, `appName "Rango Social"`, `webDir dist`. The
service worker is **registered on web only** (`src/main.tsx`) to avoid cache
conflicts inside the native WebView.

The generated `android/` and `ios/` folders are **git-ignored** — regenerate
them locally:

```bash
# 0. build the web assets first
npm run build

# 1. add the platforms (one-time; needs Android Studio / Xcode installed)
npm run cap:add:android      # npx cap add android
npm run cap:add:ios          # macOS only

# 2. copy dist + plugins into the native projects (re-run after every web build)
npm run cap:sync             # = npm run build && cap sync

# 3. open in the native IDE to run / archive
npm run cap:open:android     # Android Studio
npm run cap:open:ios         # Xcode (macOS)
```

### Native icons & splash

Generate from `Logo.png` once the platforms exist:

```bash
npx @capacitor/assets generate --iconBackgroundColor '#0F0F0F' --splashBackgroundColor '#0F0F0F'
```

### Native permissions

- **Geolocation** — Android `ACCESS_COARSE/FINE_LOCATION`, iOS `NSLocationWhenInUseUsageDescription`
- **Camera** — Android `CAMERA`, iOS `NSCameraUsageDescription` + `NSPhotoLibraryUsageDescription`

Capacitor adds most of these when the plugins are synced; add the iOS usage
strings to `ios/App/App/Info.plist`.

---

## Verify (Phase 14 DoD)

- [x] `npm run build` emits `dist/` with `sw.js` (PWA precache)
- [x] No secret strings in `dist/assets` (`GEMMA_API_KEY`, service role key)
- [ ] Installed PWA opens standalone on Android Chrome + iOS Safari
- [ ] `npx cap sync` succeeds and the Android build runs from the same `dist/`
