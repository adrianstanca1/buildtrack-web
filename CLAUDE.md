# CLAUDE.md — buildtrack-web

Next.js PWA + dashboard front-end for the BuildTrack stack. Talks to
`buildtrack-api` (Node/Express, port `:3001`) over JSON. Production
URL: `https://buildtrack.cortexbuildpro.com`.

## Stack

- **Framework**: Next.js 16 (canary) with App Router + Turbopack
- **React**: 19.2 + React Server Components for static segments
- **Styling**: Tailwind CSS 3.4 + `tailwind-merge` via `cn()` helper
- **Data**: TanStack Query 5 (`@tanstack/react-query`) for caching;
  `axios` for HTTP transport
- **State**: Zustand 5 stores (`src/stores/authStore`,
  `src/stores/themeStore`) — both `persist`-wrapped
- **Auth**: httpOnly cookies via `withCredentials: true` on the axios
  instance. The zustand `token` field is unused by the actual auth
  flow (login page never calls `setAuth`); cookies do the work.
- **Charts**: Recharts. Maps: react-leaflet.
- **Payments**: Stripe v2.1 embedded checkout (`@stripe/react-stripe-js`).
- **Offline / sync**: idb-backed `syncQueue` in `src/lib/offlineStore.ts`,
  replayed by `BUILDTRACK_REPLAY_REQUEST` window event on reconnect.
- **PWA**: service worker `/public/sw.js`, manifest `/public/manifest.json`
  (linked from the root `<head>` via Next metadata, see below).
- **Push notifications**: VAPID-keyed web-push via `src/lib/pushNotifications.ts`.
- **Tests**: Vitest 2 + jsdom + Testing Library (22 tests across
  lib/utils, lib/api, stores/authStore).

## How to run

```bash
# from /root/buildtrack-web
npm install                  # one-off
npm run dev                  # next dev (Turbopack) on :3000
npm run typecheck            # tsc --noEmit (must be 0 before pushing)
npm test                     # vitest run (22 tests, ~2s)
npm run test:watch           # vitest TUI
npm run build                # next build → triggers `postbuild`
                             # which auto-restarts pm2 buildtrack-web
npm start                    # next start (used by pm2 in prod)
```

After `npm run build` the `postbuild` script restarts the PM2 process
automatically — solves the "old chunk hashes in fresh HTML" trap
(`feedback_nextjs_pm2_rebuild_restart` memory). Don't add manual
`pm2 restart` to your workflow; it's already in the build script.

## Live service

- **PM2 process**: `buildtrack-web` (id 2), cluster mode, Next 16
- **Port**: `:3004` (set in `ecosystem.config.js`)
- **Public URL**: `https://buildtrack.cortexbuildpro.com`
- **Nginx vhost**: terminating TLS + proxying to `:3004`

## File layout

```
src/
├── app/                      # App Router pages
│   ├── layout.tsx            # root <html>; sets title template + manifest link
│   ├── page.tsx              # marketing landing
│   ├── robots.ts             # generates /robots.txt at build time
│   ├── (auth)/
│   │   ├── layout.tsx        # bare pass-through (per-page layouts set titles)
│   │   ├── login/
│   │   │   ├── layout.tsx    # exports metadata { title: 'Sign in' }
│   │   │   └── page.tsx      # 'use client' form
│   │   └── register/
│   │       ├── layout.tsx    # exports metadata { title: 'Create account' }
│   │       └── page.tsx      # 'use client' form
│   └── dashboard/            # ~50 authenticated pages
│       ├── layout.tsx        # nav + auth gate (307 → /login)
│       ├── projects/...
│       ├── tasks/...
│       └── ...
├── components/
│   ├── ui/                   # Button, Input, Card primitives
│   ├── layout/               # Sidebar, TopBar, ...
│   ├── providers/            # QueryProvider (TanStack)
│   ├── projects, tasks, ...  # domain widgets
│   └── shared/
├── hooks/                    # useAnalytics, useOnlineStatus
├── lib/
│   ├── api.ts                # axios instance + refresh interceptor + offline-queue
│   ├── offlineStore.ts       # idb wrapper for syncQueue
│   ├── pushNotifications.ts  # service-worker subscription helpers
│   ├── utils.ts              # cn / formatDate / formatCurrency / truncate
│   └── ...
├── stores/
│   ├── authStore.ts          # zustand; token field is currently unused (cookies)
│   └── themeStore.ts
└── types/
    └── index.ts              # domain types (snake_case from backend)
```

## Backend contract conventions

The `buildtrack-api` backend uses mixed casing:

- **Entity rows** (users/projects/tasks/etc): **snake_case** (matches DB columns).
  `User.first_name`, `Project.start_date`, `Task.due_date`, `Worker.hourly_rate`.
  Types in `src/types/index.ts` mirror this.
- **Reports / dashboard / AI**: **camelCase** (computed payloads).
  e.g. `/api/reports/dashboard` returns `{ totalRevenue, invoiceCount }`.
- **Response envelope** (everything): `{ success: true, data: ..., meta?: ... }`
  for success, `{ success: false, error: { message, code, details? } }`
  for failure. The axios client doesn't unwrap — callers do
  `res.data.data` or `res.data.error?.message`.

Money is `DECIMAL(15,2)` stringified on the wire (e.g. `"5400.00"`).
`formatCurrency()` in `src/lib/utils.ts` accepts both string and
number forms — always go through it for display.

## Locale defaults

UK construction is the primary audience, so `formatDate` and
`formatCurrency` default to `en-GB` / `GBP`. Callers can pass
overrides as needed — see `tests/lib-utils.test.ts`.

## Auth model — what's actually happening

1. `POST /api/auth/login` returns `{ user, accessToken }` and sets
   `accessToken` + `refreshToken` as **httpOnly cookies**.
2. The axios instance sends cookies on every cross-origin request via
   `withCredentials: true`. **No localStorage token storage.**
3. `useAuthStore.token` is `null` at runtime — nothing calls
   `setAuth()`. The zustand store persists `user` to localStorage
   under `auth-storage` so the dashboard can render the welcome
   message before the next `/auth/me` fetch resolves. **The `token`
   field is dead state — safe to remove in a future cleanup**.
4. On 401, the response interceptor in `src/lib/api.ts` calls
   `/api/auth/refresh` (cookie-based) and retries the original
   request. If refresh fails, the page redirects to `/login`.
5. The Bearer header path inside the interceptor (`originalRequest
   .headers.set('Authorization', ...)`) is a legacy belt-and-braces
   fallback — backend accepts both cookies and Authorization headers.

## Offline / sync queue

`src/lib/api.ts` intercepts failed mutations (POST/PUT/PATCH/DELETE)
while `navigator.onLine === false` and enqueues them in IDB via
`src/lib/offlineStore.ts`. When the browser fires a `BUILDTRACK_REPLAY_REQUEST`
event (typically from the service worker on reconnect), the
interceptor replays each entry once and drops it after 2 retries.

Returned synthetic response: `{ status: 202, data: { success: true, queued: true } }`
so the UI doesn't crash. Components should branch on
`response.data.queued` to show an "offline; will sync" badge.

## Known issues / debt

- **`useAuthStore.token` is dead state** — never populated. Could be
  removed entirely; the `User` payload still serves the welcome card.
- **ESLint v9 + `next lint` removed in Next 16** — `npm run lint`
  currently fails because there's no `eslint.config.js` (flat
  config). Migrate from `.eslintrc*` to `eslint.config.js` when
  cleaning up. tsc covers the typecheck side meanwhile.
- **`@vitejs/plugin-react` v6 is ESM-only** and trips vitest's CJS
  config loader, so we skip it in `vitest.config.ts`. JSX rendering
  tests would need the config renamed to `vitest.config.mts`.
- **Most dashboard pages have no per-page `<title>`** — they inherit
  the root template default. Adding `export const metadata` to each
  server-component page (or a sibling layout for client pages) is a
  good cleanup target.
- **Stripe embedded checkout requires `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`** —
  not in `.env.example`. Add when wiring payments locally.
- **Service worker pre-caches `/dashboard`** — but that route redirects
  to `/login` for unauth users, so the cache stores the redirect HTML.
  Worth tightening the `STATIC_ASSETS` list in `public/sw.js`.

## Cross-references

- Backend API spec: `/root/buildtrack-api/CLAUDE.md` + Swagger UI at
  `https://buildtrack-api.cortexbuildpro.com/api/docs`
- Sibling clients: `BuildTrack/` (Expo mobile), `BuildTrack-iOS/` (SwiftUI native)
- Workspace overview: `/root/CLAUDE.md`
- Memory cross-refs:
  - `feedback_nextjs_pm2_rebuild_restart` — why postbuild auto-restarts pm2
  - `feedback_load_bearing_security_bugs` — be careful before "cleaning up" auth state
