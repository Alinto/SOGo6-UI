# Technical Documentation — SOGo 6 Frontend (SOGo6-UI)

> Engineering reference for the SOGo 6 web client (`SOGo6-UI`, Next.js 15 / React 19 / TypeScript).
> Exhaustive map of what exists, backend-integration audit, security/performance/quality review, and a prioritized roadmap.
>
> **Method**: every claim is traced to a `src/path/file.tsx:Lxx` read during analysis. Items that cannot be verified at rest are marked `NON VERIFIED — requires runtime check`.
>
> **Cross-references**: backend behavior is cited as `(→ BACKEND §X.Y)`, pointing to `SOGo6-server/docs/BACKEND_DOCUMENTATION.md`.
>
> **Legend**: ✅ complete · 🔜 partial · ❌ not implemented · 📋 planned · ⚠️ risk · 🔴 critical · 🟡 warning · 🟢 ok

---

## §1. Executive Summary

### 1.1 Stack & versions

Source of truth: `package.json:1-131`. There is **no committed lockfile in the indexed tree** (`package-lock.json` / `yarn.lock` / `pnpm-lock.yaml` not found by glob), which mirrors the backend's missing `poetry.lock` (→ BACKEND §1.1). Versions are **mostly pinned exactly** (no `^`/`~`), which is good; the table flags the exceptions.

> ⚠️ "Latest stable (2026)" cannot be confirmed without registry access: marked `NON VERIFIED`. Pinned versions are verified from `package.json`. The qualitative gap is best-effort.

| Package | Pinned | Latest stable (2026) | Status |
|---------|--------|----------------------|--------|
| `next` | `15.5.9` | `NON VERIFIED` (16.x line exists) | 🟢 pinned; possibly 1 major behind |
| `react` / `react-dom` | `19.2.3` | `NON VERIFIED` | 🟢 current major (19) |
| `typescript` | `5.9.3` | `NON VERIFIED` | 🟢 current 5.x |
| `@reduxjs/toolkit` | `2.11.2` | `NON VERIFIED` | 🟢 current 2.x |
| `react-redux` | `9.2.0` | `NON VERIFIED` | 🟢 |
| `react-hook-form` | `7.70.0` | `NON VERIFIED` | 🟢 |
| `@hookform/resolvers` | `5.2.2` | `NON VERIFIED` | 🟢 |
| `zod` | `4.3.5` | `NON VERIFIED` | 🟢 (v4) |
| `next-intl` | `4.7.0` | `NON VERIFIED` | 🟢 |
| `next-themes` | `0.4.6` | `NON VERIFIED` | 🟢 |
| `tailwindcss` | `4.1.18` | `NON VERIFIED` | 🟢 (v4, PostCSS plugin) |
| `react-big-calendar` | `1.19.4` | `NON VERIFIED` | 🟢 |
| `@types/react-big-calendar` | `1.16.3` | — | 🟡 types lag runtime (1.19 vs 1.16) |
| `react-virtualized` | `9.22.6` | `9.22.x` (unmaintained) | 🟡 legacy; `react-window` is the modern choice |
| `ckeditor5` / `@ckeditor/ckeditor5-react` | `47.3.0` / `11.0.1` | `NON VERIFIED` | 🟢 but heavy (lazy-loaded, GPL license key, see §6.1) |
| `@dnd-kit/core` | `6.3.1` | `NON VERIFIED` | 🟢 |
| `date-fns` | `4.1.0` | `NON VERIFIED` | 🟢 (v4) |
| `framer-motion` | `12.25.0` | `NON VERIFIED` | 🟢 |
| `lucide-react` | `0.562.0` | `NON VERIFIED` | 🟢 |
| `@radix-ui/*` | mixed exact + 2 ranges | — | 🟡 `react-alert-dialog: ^1.1.15`, `react-slot: ^1.2.4`, `@swc/helpers: ^0.5.21`, `geist: ^1.5.1` use carets |
| `sonner` | `2.0.7` | — | 🟢 toasts |
| `@tanstack/react-table` | `8.21.3` | — | 🟢 admin tables |

**Tooling (dev)**: `jest 30.2.0`, `@testing-library/react 16.3.1`, `eslint 9.39.2` (flat config), `typescript-eslint 8.52.0`, `prettier 3.7.4`, `husky 9.1.7`, `lint-staged 16.2.7`, `ts-jest 29.4.6` + `babel-jest 30.2.0` (`package.json:84-121`).

**Flags to raise**:
- 🟡 **No lockfile committed** → non-reproducible installs (same risk class as backend, → BACKEND §1.1).
- 🟡 **Caret ranges** on `@radix-ui/react-alert-dialog`, `@radix-ui/react-slot`, `@swc/helpers`, `geist` (`package.json:34,48,55,66`).
- 🔴 **Build-time quality gates disabled**: `eslint.ignoreDuringBuilds: true` and `typescript.ignoreBuildErrors: true` (`next.config.mjs:5-17`) — type/lint errors do not block production builds.
- 🟡 **`reactStrictMode: false`** (`next.config.mjs:10`) — disables double-invoke checks that surface effect/cleanup bugs.

### 1.2 Module Maturity Matrix

| Module | UI Status | API wired | Backend status (→ BACKEND) | Gap |
|--------|-----------|-----------|----------------------------|-----|
| **Auth (login)** | 🔜 | ✅ `auth/login`, `auth/mode`, `system` | 🔜 login OK but **mocked** user source (→ §3.1/§4.5) | Client-only route guard; no token refresh/expiry; SSO redirect with **no callback page** |
| **Auth (SSO/callback)** | ❌ | ❌ | ❌ `NotImplementedError` (→ §3.1) | UI only does `window.location = location`; no return handler |
| **Mail — read/list/folders** | ✅ | ✅ | 🔜 ~55% (→ §3) | Mail list **not virtualized** |
| **Mail — Compose/Reply/Forward** | 🔜 (UI shell + Redux drafts only) | ❌ no send mutation | ❌ `NotImplementedError` (→ §3) | **Cannot send mail at all** |
| **Mail — batch actions / export** | ❌ | ❌ (`console.log` TODO) | ❌ `NotImplementedError` | No UI wiring |
| **Calendar (Month/Week/Day/Agenda)** | ✅ | ✅ | ✅ ~90% (→ §4.2) | No "List" view; sharing/export = WIP stub |
| **Events (CRUD/recurrence/RSVP/FreeBusy)** | ✅ | ✅ | ✅ | `users/search` autocomplete hits **non-existent backend route** |
| **Tasks** | ✅ | ✅ | ✅ ~85% | — |
| **Contacts / Address Books** | 🔜 (UI partial) | ✅ (→ fakeApi) | ❌ 0% (→ BACKEND §4.4) | **100% fakeApi**; no contact create/edit form; sharing/import/export WIP |
| **Notes** | ❌ | ❌ | ❌ | "Feature incoming" stub only |
| **Admin (Config/Domains/Rules)** | 🔜 | ✅ `/admin/v1/config/*` | ✅ ~85% (no authz) | `theme`/`system` sidebar links have no page; root page returns `null` |
| **Admin (Users/Sessions)** | ❌ | ❌ | ✅ backend has `/users/active|revoke|inactive` | No UI at all |
| **Profile** | 🔜 | ✅ `GET /profile` + `PATCH /preferences` | 🔜 ~70% | Identities save → `PATCH /mailboxes/0` = `NotImplementedError` |
| **Preferences** | ✅ | ✅ `GET/PATCH /preferences` | ✅ ~85% | **Two competing preference APIs** with incompatible shapes (→ §2.3) |
| **Mail settings (filters/vacation/forward/notifications/labels)** | ✅ | ✅ (→ fakeApi `settings/mail/*`) | ❌ Sieve 0% (→ BACKEND §3.3) | **fakeApi only**; no Sieve backend |
| **External IMAP accounts** | 🔜 | ✅ `/mailboxes` CRUD | ❌ `NotImplementedError` | Even fakeApi only supports `GET` |
| **SSE / real-time** | 🔜 (client built) | ❌ silently fails | ❌ 0% (→ BACKEND §1.2) | EventSource to dead endpoint; prod config reads wrong localStorage key |

### 1.3 Top 10 Production-Blocking Issues

| # | Issue | Severity | Evidence |
|---|-------|----------|----------|
| 1 | **JWT stored in `localStorage`/`sessionStorage`** (XSS-exfiltratable) and re-attached as Bearer. | 🔴 | `lib/redux/middleware/local-storage-sync.ts:20-31`; `lib/redux/api/api-slice.ts:119-125` |
| 2 | **No outbound mail**: compose/reply/forward are UI + Redux only; Send/Save buttons have no handler; no send mutation exists. | 🔴 | `features/mails/components/compose/floating-compose.tsx:192-199`; `mail-compose-slice.ts:264-275` (matches backend `NotImplementedError`) |
| 3 | **Build skips type-check and lint** (`ignoreBuildErrors`/`ignoreDuringBuilds`). Type regressions ship silently. | 🔴 | `next.config.mjs:5-17` |
| 4 | **Route protection is client-only**: `(loggedin)/layout.tsx` redirects in `useEffect` after hydration; no middleware/server guard. Protected HTML/JS is served before the check. | 🔴 | `app/[locale]/(loggedin)/layout.tsx:37-73`; `src/middleware.ts:50-105` (no JWT check) |
| 5 | **Regex-based HTML sanitization** for untrusted mail bodies (not DOMPurify), injected via `innerHTML` into a Shadow DOM. Regex sanitizers are bypassable. | 🔴 | `features/mails/components/mail/utils.ts:104-142,300-315` |
| 6 | **No token expiry/refresh**: JWT decoded client-side without verifying `exp`; only ad-hoc 401→logout in the mail-list error fallback. | 🟡 | `features/auth/components/login-auth-form.tsx:29-34`; `folder-messages-error-fallback.tsx:30-34` |
| 7 | **`LOGIN_PREFILL_PASSWORD` served in plaintext** by `GET /env` to anyone who can hit it. | 🟡 | `app/env/route.ts:9-21` |
| 8 | **SSE silently broken**: hardcoded/origin-derived endpoints to a backend with 0% SSE; prod config reads a non-existent `auth_token` key; EventSource ignores the configured `headers`. | 🟡 | `lib/redux/sse/sse-config.ts:49,67,75`; `sse-service.ts:58-59` |
| 9 | **Heavy `any` in the admin dynamic-form renderer** (data path that writes server config). | 🟡 | `features/admin-panel/components/form/utils.tsx` (≈49 `any`), `admin-panel-api.ts:54` |
| 10 | **Features wired to `NotImplementedError`/absent backends** with no UI guard: external IMAP accounts CRUD, profile identities, mail Sieve settings, contacts. | 🟡 | §3, §10 |

### 1.4 Top 10 Development Priorities

| # | Initiative | Effort | Business value |
|---|-----------|--------|----------------|
| 1 | Move JWT to an httpOnly, Secure, SameSite cookie; remove `localStorage` token; add a server/middleware auth guard. | M | Security blocker |
| 2 | Wire outbound mail (compose/reply/forward → send mutation) once backend exists; until then, disable/guard the UI. | M (UI) / blocked on backend | Webmail unusable without send |
| 3 | Re-enable `typescript.ignoreBuildErrors:false` + ESLint in CI; commit a lockfile. | S | Prevents silent regressions |
| 4 | Replace regex sanitizer with DOMPurify (or render mail in a sandboxed `<iframe sandbox>`). | S | XSS hardening |
| 5 | Implement token-expiry handling + global 401 interceptor (`baseQuery` wrapper) → logout/redirect. | M | Session correctness |
| 6 | Remove `LOGIN_PREFILL_PASSWORD` from `/env` in non-dev; gate behind `NODE_ENV`. | S | Secret exposure |
| 7 | Consolidate the two `/preferences` APIs into one typed contract. | S | Removes a data-shape footgun |
| 8 | Add empty/error/loading states where missing (mail viewer error swallowed, admin `alert()`, hardcoded `'ERROR'`). | M | UX/production polish |
| 9 | Virtualize the mail list (and contact list) with `react-window`/TanStack Virtual. | M | Perf at scale |
| 10 | Add `eslint-plugin-jsx-a11y` explicitly + a CSP header; remove dev `console.*`. | M | A11y + security |

---

## §2. Architecture Deep Dive

### 2.1 Project Structure

Feature-sliced architecture: domain logic lives under `src/features/<domain>/`, shared primitives under `src/components/ui/` (shadcn/Radix). Routing is Next.js **App Router** with locale segments and route groups.

```
src/
├── app/                          → App Router. Locale segment + route groups.
│   ├── [locale]/(auth)/          → login flow (email → mode → password)
│   ├── [locale]/(loggedin)/      → protected app: u/ (mail), calendars/, tasks/,
│   │                               address_books/, user_settings/, admin_panel/
│   ├── [locale]/(others)/        → compose/ (full-screen composer)
│   ├── env/route.ts              → runtime env (REACT_APP_API_BASE_URL, prefill, SSE)
│   └── fakeApi/                  → ~50 Next route handlers mocking the backend (dev)
├── components/
│   ├── ui/                       → shadcn/Radix primitives (button, dialog, table…)
│   ├── calendar/                 → react-big-calendar wrapper + CSS
│   ├── sidebar/                  → app shell sidebar/rail
│   └── dynamic-imports.tsx       → next/dynamic helper (mostly commented examples)
├── features/                     → feature-slice modules (see below)
│   ├── auth/  mails/  calendars/  tasks/  address_books/
│   ├── admin-panel/  user-settings/  user-profile/  app-data/
│   ├── themes/  notifications/
├── hooks/                        → 11 generic hooks (useEventListener, useMediaQuery…)
├── lib/
│   ├── redux/                    → store, reducerManager, apiSlice, sse, middleware
│   ├── i18n/                     → next-intl config/navigation
│   ├── auth/                     → getSessionUser.ts (FULLY COMMENTED — dead)
│   └── env-service.ts            → /env fetch + dev health-check fallback to /fakeApi
└── messages/en/                  → translation JSON (en only; see §3 Auth)
```

Patterns: **feature-slice** (not atomic design). Each feature typically has `components/`, `store/` (RTK Query + slices), `hooks/`, `*-types.ts`, `utils/`, and colocated `__tests__/`. This is consistent and modern.

### 2.2 Routing Architecture

**Middleware** (`src/middleware.ts:50-105`) handles **only**: locale redirect (`63-67`), and **domain-based routing** — admin hostnames are forced to `/admin_panel` (`77-90`), user hostnames are blocked from `/admin_panel` except in dev (`94-100`). Admin domains come from `NEXT_PUBLIC_ADMIN_DOMAINS` (`middleware.ts:18-21`). **There is no JWT/auth check in middleware.**

Route map (App Router, under `[locale]`):

| Route | File | Notes |
|-------|------|-------|
| `(auth)/` → `auth/login` | `(auth)/page.tsx:3-5` | `redirect('./auth/login')` |
| `auth/login` | `(auth)/auth/login/page.tsx` | email step (`LoginForm`) |
| `auth/login/pwd` | `(auth)/auth/login/pwd/page.tsx:5-7` | password step (`LoginAuthForm`) |
| `(loggedin)/layout.tsx` | client-only token guard | mounts `FloatingComposeContainer`, SSE connect, DnD |
| `u`, `u/[account]`, `u/[account]/[folder]` | mail | parallel routes `@classic`, `@visualization` (split/modern layouts) |
| `u/[account]/[folder]/[mail_id]` | mail viewer | ordered prev/next via `mailNavigation` slice |
| `calendars`, `calendars/layout` | calendar | `LazyCalendarView` |
| `tasks` | tasks | |
| `address_books`, `[book_id]`, `[book_id]/@visualization/[contact_id]` | contacts | redirect hardcoded → `/address_books/work` (`address_books/page.tsx:5`) |
| `user_settings/**` | settings | profile, security, general, mail/*, calendars/*, address_books |
| `admin_panel`, `admin_panel/domains/default`, `.../custom_domains[/id]`, `admin_panel/rules` | admin | root `admin_panel/page.tsx` returns `null` |
| `(others)/compose` | full-screen composer | Save/Send buttons have no handlers |

**UI routes without a backend counterpart**: `address_books/**` (→ contacts 0% backend), `user_settings/mail/{filters,vacation,forward,notifications,labels}` (→ Sieve 0%), `admin_panel/theme` & `admin_panel/system` (sidebar links with **no page**, → §3 Admin). **SSO callback** `/auth/callback/<domain>` exists on the backend as `NotImplementedError` and has **no UI route** at all.

**Backend endpoints with no UI route**: `/users/active|revoke|inactive` (admin sessions — no UI, → §3 Admin), `get_mailbox_quota` (no backend route either), mail `export`/`batch-action` (→ §3 Mail).

### 2.3 State Management

**Store** (`lib/redux/store.ts:25-58`): a `reducerManager` (`reducer-manager.ts`) enables dynamic reducer injection. Static reducers: `auth`, `calendarUi`, `tasksUi`, `mailCompose`, `mailLayout`, `mailNavigation`, `notifications`, plus `apiSlice.reducer` and `sseApi.reducer`. Middleware chain: `listenerMiddleware` → `apiSlice.middleware` → `sseApi.middleware` → `localStorageSyncMiddleware` (`store.ts:45-50`). Preloaded auth state is hydrated from storage on boot (`store.ts:18-23`).

**RTK Query services**. There are **two** `createApi` instances:
- `apiSlice` (`lib/redux/api/api-slice.ts:136-141`) — the single shared API for the whole app; all features `injectEndpoints` into it. `tagTypes` are centrally declared (`api-slice.ts:47-83`). `baseQuery` is a custom `dynamicBaseQuery` (resolves base URL from `/env`, attaches Bearer token).
- `sseApi` (`lib/redux/sse/sse-api.ts:47-155`) — separate API with a **hardcoded** `baseUrl: 'http://localhost:8888/sse'` (`sse-api.ts:39-41`) used as a no-op base for `queryFn`-driven endpoints.

Injected endpoints by feature (all on `apiSlice`):

| Feature file | Endpoints | Tags | Optimistic | Notifications |
|--------------|-----------|------|------------|---------------|
| `mails/store/mails-api.ts` | getFolders, getFolderMessages, getMail, moveToTrash, mailAction, purgeFolder, expungeFolder, get/setFolderShare, create/deleteFolder | `mails/folders`, `folder/messages`, `mail`, `folder/share` | ✅ mark-as-read patch (`:594-630`), seen toggle (`:667-698`) | ✅ via `createApiNotificationHandler` |
| `calendars/store/calendars-api.ts` | getCalendars, getCalendarById, create/update/deleteCalendar, external-calendars CRUD+sync, events CRUD, getEvents, getEventsInTimeRange, searchEvents, postEventAttendance, getFreeBusy, searchUsers, updateCalendarVisibility | `calendars`, `calendar_events`, `calendar_sync`, `user_search` | ✅ attendance cache patch (`:574-588`); ⚠️ `updateCalendarVisibility` is **local-only** (`:791-835`) | ✅ |
| `tasks/store/tasks-api.ts` | getTasks, getCalendarTasks, getTaskById, create/update/deleteTask | `tasks` | optimistic completion in `use-task-state.ts:47-61` | ✅ |
| `admin-panel/store/admin-panel-api.ts` | getSystem, getDomains, getRules, getDynamicForm, getDomainDefault, get/save/patchCustomDomainConfig, patchDomainDefault, deleteDomain | `adminConfig*`, `/admin/v1/config/*` | ❌ | ❌ (uses `alert()`) |
| `user-profile/store/profile-api.ts` | getUserProfile | `profile` | ❌ | throws on `error_code !== 'S000000'` |
| `user-settings/store/user-preferences-api.ts` | getUserPreferences + 8 granular `PATCH /preferences` mutations (`{settings:{USER_*}}`) | `preferences`, `profile` | ❌ | ✅ |
| `app-data/store/user-preferences-api.ts` | getPreferences, updatePreferences (flat body) | `preferences` | ❌ | ❌ |
| `user-settings/mail/external-accounts/store/mailboxes-api.ts` | get/create/update/deleteUserMailbox(+Profile) | `mailboxes` | ❌ | ✅ (skippable) |
| `address_books/store/address-books-api.ts` | getAddressBooks, getAddressBookVCards, getVCard, updateVCard, add/deleteVCard, add/update/deleteAddressBook | `address_books`, `vcard` | ❌ | ❌ |
| `user-settings/mail/{filters,vacation,forward,notifications,labels}/store/*.ts` | get/update `settings/mail/<x>` | per-slice | ❌ | partial |
| `themes/store/themes-api.ts` | getThemes (`customization/themes`) | — | ❌ | ❌ |

**Redux slices (client state)**:
- `auth.slice.ts` — `{ token, user, rememberMe }`; `setCredentials`, `logout`; `selectIsAuthenticated = token !== null`.
- `mail-compose-slice.ts` — full multi-draft model (max 3 open, recipients/subject/body/attachments/priority, `isSending`/`sendError`). **`isSending`/`setSendError`/`updateBody` are never dispatched by production UI** (§3 Mail).
- `mail-layout-slice.ts`, `mail-navigation-slice.ts` — split/full mode, ordered mail IDs.
- `calendar-ui-slice.ts` — single `createEventRequested` flag.
- `tasks-ui-slice.ts` — status/calendar/search filters.
- `notifications` slice — toast queue.

**Server vs local state**: server data lives in RTK Query cache (good — not duplicated into slices). Notable exception: **calendar visibility** (`u_hidden`) is patched directly into RTK Query cache with no server persistence (`calendars-api.ts:791-835`) — lost on refresh.

**Anti-patterns / direct fetch bypassing RTK Query**:
- `lib/env-service.ts:32,80` — raw `fetch('/env')` and a HEAD health-check (justified: bootstrap before store).
- `lib/redux/sse/sse-service.ts:58-59` — native `EventSource` (justified: SSE is not HTTP-fetchable, but see §10).
- ⚠️ **Two `/preferences` contracts**: `user-settings` PATCHes `{settings:{USER_*:…}}` (`user-preferences-api.ts:22-30`), while `app-data` PATCHes a **flat** `{theme, mailDisplayMode,…}` (`app-data/store/user-preferences-api.ts:11-21`) with an incompatible type. Against the real backend, the `app-data` shape cannot interpret the SOGo response. Used by the mail view toggle/layout (`mail-view-toggle.tsx:6-8`, `u/[account]/[folder]/layout.tsx:10`).
- ⚠️ **Endpoint name collision**: both `auth.api.ts:45` and `admin-panel-api.ts:25` inject an endpoint named `getSystem` (with `overrideExisting:false`). Only the first-registered wins; the admin `useGetSystemQuery` is **never imported** by any page (→ §3 Admin).

### 2.4 Authentication Flow

**Token lifecycle**:
1. Two-step login (§3.1). On success, `useLoginMutation` returns `{ data: { jwt_token } }` (`auth.api.ts:8-12`).
2. The JWT payload is **decoded client-side without signature/exp verification** (`login-auth-form.tsx:29-34`, `atob`).
3. `setCredentials({ token, user, rememberMe })` writes to the `auth` slice (`auth.slice.ts:25-32`).
4. `localStorageSyncMiddleware` persists on any `auth/*` action: `rememberMe` → `localStorage['sogo_auth']`, else `sessionStorage['sogo_auth']` (`local-storage-sync.ts:16-35`). On boot, `loadAuthFromStorage` rehydrates (`:58-86`).
5. Token attached to every request via `prepareHeaders` → `Authorization: Bearer <token>` (`api-slice.ts:119-125`).

🔴 **Security implication**: token in Web Storage is readable by any injected script (XSS). Combined with regex-only mail sanitization (§5), this is the highest-impact frontend risk.

**Token refresh / expiry**: **none.** No refresh token, no `exp` check, no global 401 interceptor in `dynamicBaseQuery`. The only expiry handling is in the mail-list error fallback (`folder-messages-error-fallback.tsx:30-34`: 401 → `logout()` + redirect). Elsewhere a 401 surfaces as a generic error. (→ BACKEND §4.5: backend has no refresh either; HS256 only.)

**SSO/callback**: `auth/mode` may return `kind: 'sso'` with a `location`; the UI does `window.location.href = location` (`login-form.tsx:110-111`). There is **no `/auth/callback` route** to consume the IdP redirect — SSO cannot complete in the UI. The backend `GET /auth/callback/<domain>` is `NotImplementedError` (→ BACKEND §3.1). 🔴 Both ends are missing.

**`ALLOW_AUTH_BASIC` dev bypass**: the backend has a Basic-auth debug branch (→ BACKEND §2.3). There is **no corresponding frontend bypass**. The only dev affordance is `LOGIN_PREFILL_EMAIL/PASSWORD` (auto-fill, still requires a real `POST /auth/login`) and an automatic fallback to `/fakeApi` when the configured API is unreachable (`env-service.ts:92-108`).

**Logout**: `header-dropdown.tsx:145-154` dispatches `logout()` + redirect; the middleware clears both storages (`local-storage-sync.ts:32-35`). No backend revoke / OIDC end-session call (although the backend *can* revoke server-side, → BACKEND §4.5).

### 2.5 API Layer Analysis

All user-facing endpoints use **bare relative paths** (e.g. `profile`, `preferences`, `calendars`, `events`, `tasks`, `mailboxes/...`, `freebusy`, `users/search`) joined to `cachedBaseUrl` (`REACT_APP_API_BASE_URL` or `/fakeApi`). The backend user prefix is `/api/user/v1` (→ BACKEND §3); therefore `REACT_APP_API_BASE_URL` must be `…/api/user/v1`. Admin endpoints, however, use **`/admin/v1/config/*`** on the *same* base query — ⚠️ structurally these only resolve correctly against `/fakeApi` (which has `fakeApi/admin/v1/...` routes). Against a real backend whose base is `/api/user/v1`, admin calls would become `/api/user/v1/admin/v1/...`. Admin runs on a separate hostname (§2.2), so its base URL handling needs runtime verification: `NON VERIFIED — requires runtime check`.

See the full integration matrix in **§10**. Highlights of mismatches:
- `users/search` (calendars-api.ts:39) → **no backend route** (backend `/users/*` are admin-only).
- `mailboxes` CRUD → backend `NotImplementedError`; `compose` not even called.
- `settings/mail/*` → **no backend** (Sieve unimplemented).
- `address_books/*`, `customization/themes` → **no backend**.
- `events` query params `start_date_time`/`end_date_time` (calendars-api.ts:617-620) vs backend schema: `NON VERIFIED`.

---

## §3. Module-by-Module UI Analysis

### §3.1 Auth

**Current UI state.** Two-step login. `LoginForm` (`features/auth/components/login-form.tsx`) fetches `useGetSystemQuery()`; if `SOGO_S_DIRECT_LOGIN` it jumps straight to `/auth/login/pwd` (`:83-88`). Otherwise the user enters email, `getAuthMode({username})` is called (`:95-120`), and branches: `plain` → pwd page; `ldap` → pwd page with `&mode=ldap` (label only, **no distinct API**, `login-auth-form.tsx:165-168`); `sso` → `window.location = location`; else error.

**Components.**
- `login-form.tsx` — email step. Loading spinner on `systemLoading` (`:124-129`). Error via `getErrorMessage`. ⚠️ Language dropdown hardcoded to `['en']` (`:34`) despite i18n locales.
- `login-auth-form.tsx` — password step. Zod schema; `rememberMe`; prefill from `/env`; `decodeJwtPayload` (no verification). 401 → invalid-credentials message (`:131-132`).

**Backend integration.** `auth/login` ✅, `auth/mode` 🔜 (plain only, → BACKEND §3.1), `system` ✅. **Not wired**: `auth/callback` (no UI). 

**Missing vs production.** Token refresh; `exp` handling; SSO completion; account lockout/rate-limit feedback; password reset flow (`SOGO_D_PWD_RECOVERY` exists in backend settings but no UI flow); MFA challenge (settings exist, no UI).

### §3.2 Mail

**Current UI state.** Read path is the most complete part of the app. Routes under `u/[account]/[folder]` with **parallel routes** (`@classic` split view + `@visualization`) and a "modern" single view (`u/[account]/[folder]/layout.tsx:22-86`). Folder tree, message list, message viewer, folder CRUD/share/purge/expunge are functional.

**Component breakdown (selected).**

| Component | File | Data source | Loading | Error | Empty |
|-----------|------|-------------|---------|-------|-------|
| Folder list page (modern) | `u/[account]/[folder]/page.tsx:13-62` | `useFolderMessages` | `ListSkeleton` (`:36`) | `FolderMessagesErrorFallback` (`:38-47`) | `list.tsx:157-160` i18n |
| Classic split list | `@classic/page.tsx:11-60` | `useGetFolderMessages` | `ListSkeleton` (`:38-43`) | ⚠️ **no error branch** | `@classic/layout.tsx:8-16` |
| Message list | `features/mails/components/list.tsx:57-198` | RTK query + mutations | skeleton (`:144-146`), 60% opacity while fetching (`:156`) | via fallback | i18n (`:157-160`) |
| Mail viewer | `[mail_id]/page.tsx:34-217` | `useGetMailQuery` | `MailDetailSkeleton` (`:72`) | ⚠️ `return null` — **error swallowed** (`:73`) | n/a |
| Mail body | `mail/mail-content.tsx:14-43` + `mail/utils.ts` | props | — | — | — |
| Compose window | `compose/floating-compose.tsx:20-205` | `mailCompose` slice | CKEditor lazy spinner | ⚠️ `sendError` never displayed | — |
| Folder picker (search) | `search-folders.tsx:41-124` | `useGetFolders` | — | — | — |

**Compose / Reply / Forward — CRITICAL.** Compose is a **UI shell + local Redux drafts only; nothing is sent.**
- No compose/reply/forward/send mutation exists in `mails-api.ts` (`:445-851`).
- Save/Send buttons have **no `onClick`** (`floating-compose.tsx:192-199`; `(others)/compose/page.tsx:38-44`).
- Reply/forward icons in the viewer have **no `onAction`** (`[mail_id]/page.tsx:155-167`); clicks are inert.
- `mail-compose-slice` defines `inReplyTo`/`forwardOf`/`isSending`/`setSendError`/`updateBody`, but they are **never dispatched** by production code; `compose-opener.tsx:31-35` only opens an empty draft. The CKEditor in `compose.tsx` is mounted **without** an `onChange` wired to `updateBody`.
- (→ BACKEND §3: `compose`/`reply`/`forward`/`batch-action` all `NotImplementedError`.) Both ends are unimplemented.

**HTML rendering.** `MailContent` decodes base64 if needed, rewrites `data-src`, blocks external images until the user opts in (`mail-content.tsx:35-37`, `utils.ts:84-94`), then renders via `ShadowEmailContent` — a Shadow DOM host whose `innerHTML` is set to a **regex-sanitized** string (`utils.ts:104-142,300-315`). **No DOMPurify, no `dangerouslySetInnerHTML`, no `<iframe>`.** Shadow DOM isolates CSS, not script execution; the regex is the only XSS barrier (§5).

**Virtualization.** `react-virtualized` is used **only** for the folder picker (`search-folders.tsx:14,92-116`). The **mail list is not virtualized** (`list.tsx:162-191` is a plain `.map`). 🟡 Perf risk on large folders.

**Backend ops with no UI**: `batch-action` (toolbar logs `console.log('TODO bulk …')`, `list-toolbar.tsx:91-95`), folder `export`. **Stubs/hardcoded**: `list/list-header.tsx` is an orphan `<h2>Mail List</h2>`; archive folder hardcoded `'Archive'` (`list.tsx:28`); `formatMailTime` hardcoded `'fr-FR'` (`mail/utils.ts:26`); prev/next in classic visualization is `Number(mail_id) ± 1` (`@visualization/[mail_id]/page.tsx:70-73`).

**Missing vs SOGo 5 / 2026**: send, drafts persistence, signatures, threading/conversation view, server search, push/IDLE notifications.

### §3.3 Calendar / Events

**Views.** `react-big-calendar` wraps Month/Week/Day (`components/calendar/index.tsx`; `calendar-view.tsx:124-307`, DnD-enabled at `:256-301`); **Agenda is a custom list** (`agenda-view.tsx:23-129`, capped at 100 events). Default view = week (`useCalendarState.ts:109`). **No List view** (`Views.LIST` unused). Dedicated **mobile** views: `mobile-calendar-view.tsx` orchestrates `mobile-month/week/day-view.tsx`. Lazy-loaded via `LazyCalendarView` (`ssr:false`, `calendar-view-lazy.tsx:9-14`).

**Event CRUD.** Create from grid slot or sidebar (`calendar-view.tsx:87-121`; `sidebar/create-event-opener.tsx`); `LazyEventForm` (`event-form-lazy.tsx`). Recurrence editor (`recurrence-selector.tsx`) supports **FREQ, INTERVAL, BYDAY (weekly), BYMONTHDAY (monthly), UNTIL, COUNT**; `by_month` is typed but **not exposed**; `week_start` fixed to `'MO'` (`:65`). Recurrence scope (ONE/THISANDFUTURE/ALL) via `recurrence-scope-dialog.tsx`. (→ BACKEND §4.2: RRULE engine is near-complete; UI exposes a subset.)

**RSVP / attendance.** Accept/Tentative/Decline buttons when the user is an attendee (`visualization/index.tsx:413-430`) → `usePostEventAttendanceMutation` (`calendars-api.ts:553-608`). `delegated` is in the type but has no button. (→ BACKEND §3.1: attendance builds an iMIP REPLY that is **never sent** — SMTP not wired, so the UI shows success but no email leaves.)

**FreeBusy.** Scheduling assistant timeline (`timeline-freebusy.tsx:533-686`) driven by `useGetFreeBusyQuery` (`event-form.tsx:312-338`, `skipToken` until attendees+dates). ⚠️ Demo fallback data `DEFAULT_TEAM_MEMBERS`/`SAMPLE_API_DATA` (`utils.ts:53-130`) is the component default; production passes real emails (`event-form.tsx:340-346`).

**Attendee search.** `attendee-input.tsx:63-66` calls `useSearchUsersQuery` → `users/search` — ⚠️ **no backend route** (→ §10).

**Sharing / public token.** Calendar ACL sharing and export are **`WorkInProgress` stubs** (`sidebar/sidebar-item.tsx:260-263`). The "subscription link" builds `${origin}/calendars/${id}/subscribe` using the calendar **id, not `share_token`** (`sidebar/actions/link.tsx:14-28`) — does not match the backend public-token capability URL `/public/calendars/<token>` (→ BACKEND §3.1). ⚠️ Mismatch.

**External calendars (ICS).** Full CRUD + manual sync + status (`sidebar/forms/add-external.tsx`, `sidebar-item.tsx:46-87`; `calendars-api.ts:391-467`). ✅ Aligned with backend.

**States.** Grid has **no global loading skeleton** (`useGetEventsQuery` without page-level loading UI); detail uses inline `Skeleton` (`calendars/page.tsx:297-302`); mutations surface via notifications. No TODO/FIXME found in `features/calendars`. `any` mostly in tests.

### §3.4 Tasks

Route `tasks/page.tsx` → `tasks-page.tsx:21-133`. Full CRUD (`tasks-api.ts`), optimistic completion checkbox with rollback (`task-complete-checkbox.tsx:14-85`; `use-task-state.ts:47-61`), smart-view filters (all/today/upcoming/overdue/completed, `sidebar/sidebar.tsx:74-120`; `utils/task-list-filter.ts`), calendar scoping and search (`tasks-ui-slice.ts`; `use-tasks-source.ts`). Loading skeleton (`task-list.tsx:20-44`), empty state (`task-empty-state.tsx`). ✅ Solid, aligned with backend (→ BACKEND §4.3).

### §3.5 Contacts / Address Books

**100% fakeApi; 0% backend** (→ BACKEND §4.4). All operations go through `address-books-api.ts` (`address_books`, `address_books/{id}`, `address_books/{book}/{id}`) with fakeApi route handlers under `app/fakeApi/address_books/**`.

UI: list (`components/list.tsx:16-104`, empty `:80-84`), contact card (`visualization/index.tsx:16-136`), `ContactHeader`, field rows. ⚠️ **Partial UI**: there is **no full contact create/edit form** — only `note-field.tsx` calls `updateVCard`; `addVCardToAddressBook`/`deleteVCardFromAddressBook` are defined but **not exported and never used** (`address-books-api.ts:34-58` vs exports `:93-101`). Address-book sharing/import/export are `WorkInProgress` (`sidebar/sidebar-item.tsx:147-158`). Contact error → `return null` (`@visualization/[contact_id]/page.tsx:18-20`). `/address_books` redirect hardcoded to `/address_books/work` (`page.tsx:5`).

### §3.6 Notes

❌ **No module.** No `src/features/notes`, no `src/app/**/notes`. Only a "coming soon" stub in the mail fast-access rail (`mails/.../fast-access/content/notes-content.tsx:4` → `<FeatureIncoming/>`) and a dead `/notes` rail link (`module-rail.tsx:26,66-68`). (`address_books/.../note-field.tsx` is a vCard NOTE field, unrelated.)

### §3.7 Admin (Config / Domains / Rules)

**Screens.** `admin_panel/page.tsx` returns `null`. Implemented: `domains/default` (dynamic form), `domains/custom_domains` (TanStack table), `custom_domains/[id]` (dynamic form), `rules` (table). ⚠️ Sidebar links `/admin_panel/theme` and `/admin_panel/system` (`features/admin-panel/components/sidebar/content.tsx:8,14`) have **no page** → 404.

**Dynamic form engine.** Metadata from `useGetDynamicFormQuery` (`/admin/v1/config/dynamic-form`) drives `createDynamicSchema`/`createDefaultValues` (`form/utils.tsx:244+,333+`) → `AdminDomainFormFrame` → `SectionRenderer` → `FieldRenderer` with `depends`/visibility (`admin-panel-field-renderer.tsx`). Submit diffs values and PATCHes (`use-domain-config.ts:289-336`).

**Backend integration.** Config CRUD ✅ (→ BACKEND §3.2) but the backend admin API is **unauthenticated** (→ BACKEND §5) — the frontend adds no extra protection (same client-only guard). The admin `getSystem` endpoint is never used by any page; `/users/*` session management has **no UI**.

**States/debt.** Errors via `alert()` (`use-domain-config.ts:326-335`, `admin-data-table.tsx:123-127`, `domain-columns.tsx:108-111`); table empty state i18n (`admin-data-table.tsx:239-246`); heavy `any` (`admin-panel-api.ts:54`; `form/utils.tsx`; `domain-columns.tsx:30-31`); hardcoded English strings in dialogs/headers; several TODOs (`skeletons/admin-form-page-skeleton.tsx:5`, etc.).

### §3.8 Profile / Preferences / Settings / External accounts

- **Profile** (`profile-api.ts`): `GET /profile` (5-min cache, throws on `error_code !== 'S000000'`). `useProfile` derives feature toggles. Profile form saves identities via `PATCH /mailboxes/0` (❌ `NotImplementedError`) + picture via `PATCH /preferences` (✅). Basic-info fields are read-only. Avatar source (gravatar/libravatar/usersource/default) in `use-avatar-source.ts` with `cancelled`-flag cleanup.
- **Preferences**: two APIs (§2.3) — `user-settings` (`{settings:{USER_*}}`, ✅ backend-aligned) and `app-data` (flat, ❌ shape mismatch).
- **Mail settings** filters/vacation/forward/notifications/labels → `settings/mail/*` = **fakeApi only** (Sieve 0% backend, → BACKEND §3.3). `labels` route is **orphaned** (not in sidebar).
- **External IMAP accounts**: `mailboxes` CRUD (❌ all `NotImplementedError` except `GET /{id}`); fakeApi only supports `GET`, so create/update/delete fail even in dev. Password form is `console.log` only, no API (`password-form-core.tsx:27-28`).

### §3.9 Notifications / SSE

Toasts via `sonner` + `notifications` slice + `createApiNotificationHandler` (`features/notifications/api-notification-handler.ts`). SSE client is fully built (`SSEService`, `sseApi`, reconnect/heartbeat, mail:received listener) but: backend SSE = **0%** (→ BACKEND §1.2); the prod config points to `${origin}/api/sse` and reads `localStorage.getItem('auth_token')` — a **key that is never written** (token lives under `sogo_auth`), and native `EventSource` ignores the `headers`/`withCredentials` config object (`sse-service.ts:58-59`). Result: connect → error → max 3 retries → give up, silently. 🟡

---

## §4. TypeScript Quality Audit

### 4.1 Type Coverage

- `strict: true` ✅ (`tsconfig.json:6`); `noImplicitAny` is implied by `strict`. `skipLibCheck: true`, `target: ES2017`, `moduleResolution: bundler`, path alias `@/*` (`tsconfig.json:3-23`).
- 🔴 **`typescript.ignoreBuildErrors: true`** (`next.config.mjs:11-17`) — strictness is **not enforced at build**; `npm run type-check` (`tsc`) is a separate, non-blocking step.
- Coverage is **high** in feature components and types. `any` is **concentrated**, not pervasive: outside tests, the densest are the admin dynamic-form layer (`admin-panel/components/form/utils.tsx` ≈49 `any`; `admin-panel-api.ts:54` `Record<string, any>`; `admin-panel-form.tsx`, `section-renderer.tsx`, `domain-columns.tsx`), plus `components/ui/dict.tsx`, `components/ui/forms/utils.tsx`, `lib/redux/reducer-manager.ts`, `lib/redux/sse/hooks/use-mail-received-listener.ts`, and `hooks/use-event-listener.ts`.
- Mail and calendar feature components are essentially `any`-free in production (tests aside).

### 4.2 API Contract Types

- Backend response types are **hand-written** TypeScript interfaces per feature (`mails-types.ts`, `calendars-types.ts`, `tasks-types.ts`, `user-preferences-api-types.ts`, etc.). **No codegen** (no `openapi-typescript`/`zod-to-ts`), so types can drift from the marshmallow schemas (→ BACKEND §3).
- Responses are defensively unwrapped: most endpoints accept `BackendResponse<T> | T` and normalize (e.g. `mails-api.ts:449-546` tolerates array / `{messages}` / `{mails}` / `{data}` shapes; `calendars-api.ts:129-243`). This is robust against shape changes but hides contract mismatches.
- Request payloads are typed (`CalendarEventCreateBody`, `CreateFolderBody`, `MailboxPOST`, …) and validated by Zod in forms.
- **Known mismatches**: `EventRecurrence` (`calendars-types.ts:11-19`) omits backend RRULE features (BYSETPOS, BYWEEKNO, BYYEARDAY, etc., → BACKEND §4.2); `users/search` response type exists with no backend; `app-data` preferences type is incompatible with the SOGo `{settings}` shape (§2.3).

### 4.3 Type Anti-Patterns

- `as any` / casts: `external-accounts-edit-form.tsx:60` (`zodResolver(...) as any`); the RTK cross-endpoint cache helpers use `as unknown as` casts deliberately (`mails-api.ts:317-379`, documented as an RTK limitation); `calendars-api.ts:252` `as unknown as UpdateQueryDataFn`.
- Client-side JWT decode trusts structure without validation (`login-auth-form.tsx:29-34`).
- `themes-api.ts:6` types the response as `CSSStyleSheet` for a JSON endpoint — incorrect.
- Untyped event handlers / `any` props largely confined to admin form renderer.
- `use-permissions.ts` reads `settings?.permissions` which does not exist on `UserPreferencesResponse` → effectively dead/incorrect.

---

## §5. Security Audit

| Risk | Severity | File:Line | Current state | Fix | Effort |
|------|----------|-----------|---------------|-----|--------|
| JWT in `localStorage`/`sessionStorage` | 🔴 Critical | `local-storage-sync.ts:20-35`; `api-slice.ts:119-125` | XSS-readable bearer token persisted in Web Storage | httpOnly+Secure+SameSite cookie; token in memory only | M |
| Regex HTML sanitization for mail bodies | 🔴 Critical | `mail/utils.ts:104-142,300-315` | Hand-rolled regex strips scripts/handlers, injected via `innerHTML` in Shadow DOM | DOMPurify, or `<iframe sandbox>` rendering | S |
| Build skips type/lint checks | 🔴 Critical | `next.config.mjs:5-17` | `ignoreBuildErrors`/`ignoreDuringBuilds` | Re-enable; gate CI | S |
| Client-only route guard | 🔴 Critical | `(loggedin)/layout.tsx:37-73`; `middleware.ts:50-105` | Redirect after hydration; no server/middleware check | Add middleware/server-side session check | M |
| `LOGIN_PREFILL_PASSWORD` in `/env` | 🟡 High | `app/env/route.ts:9-21` | Plaintext password returned to any caller | Strip in non-dev; never serve passwords | S |
| No token expiry/refresh; no global 401 handler | 🟡 Med | `dynamicBaseQuery` (`api-slice.ts:90-134`) | Only mail-list fallback logs out on 401 | `baseQuery` wrapper → on 401 logout/redirect | M |
| Client JWT decode without verification | 🟡 Med | `login-auth-form.tsx:29-34` | `atob` of payload, no `exp`/signature check | Validate `exp`; treat token as opaque | S |
| No Content-Security-Policy | 🟡 High | `next.config.mjs:97-109` | Only `X-Robots-Tag` header set | Add CSP (script-src, frame-ancestors, etc.) | M |
| `dangerouslySetInnerHTML` | 🟢 | — | None found in `src` | — | — |
| SSE prod config reads wrong key / uses `withCredentials` against `origins:"*"` | 🟡 Med | `sse-config.ts:67-77` | `Bearer ${localStorage.getItem('auth_token')}` (key never set) | Fix key; EventSource cannot send headers anyway | S |
| CORS `origins:"*"` + bearer (backend) | 🟡 | (→ BACKEND §5) | Frontend uses bearer (not cookies) so CSRF surface is low today; would change if cookies adopted | Allowlist origins backend-side | — |
| Error messages leak detail | 🟡 Low | `error-handlers.ts:42-43` | `console.error` of raw error objects in prod; `alert(error)` in admin | Sanitize user-facing errors; gate logs | S |
| ~`console.*` left in production | 🟡 Low | many (env-service, sse, calendars-api, list-toolbar…) | Dev logging not stripped | Strip via compiler/option; lint rule | S |
| `.env*` handling | 🟢 | `.gitignore:29-34` | `.env.development`/`.env.production`/`.env*.local` ignored; `.env.example` kept | OK | — |
| `NEXT_PUBLIC_*` exposure | 🟢/🟡 | `middleware.ts:19`; `env/route.ts` | `NEXT_PUBLIC_ADMIN_DOMAINS` (non-secret); secrets routed via `/env` server route (not `NEXT_PUBLIC`) | Keep secrets out of `/env` | — |
| Path/URL construction | 🟢 | `mails-api.ts`, `calendars-api.ts` | `encodeURIComponent` on dynamic segments | OK | — |

**Dependency CVEs**: cannot audit without a lockfile/registry — `NON VERIFIED — requires runtime check`. Recommend committing a lockfile and adding `npm audit`/Snyk in CI.

**CSP / headers**: the only configured header is `X-Robots-Tag: noindex,nofollow` (`next.config.mjs:97-109`). No CSP, no `X-Frame-Options`/`frame-ancestors`, no HSTS (likely terminated at a proxy — document it).

### Mail XSS — detailed

`sanitizeEmailHtml` (`mail/utils.ts:104-142`) removes `<script>`, inline `on*` handlers, `javascript:` hrefs, non-image `data:` URIs, neutralizes `iframe/object/embed/form/base/meta refresh`. It is then set via `contentContainer.innerHTML` inside an open Shadow DOM (`:172,308-315`). **Shadow DOM isolates CSS but not JS**; the regex is the sole script barrier. Regex HTML sanitizers are historically bypassable (mutation XSS, malformed markup, SVG/MathML vectors). 🔴 Replace with DOMPurify or a sandboxed iframe. External images are blocked until the user clicks "show images" (`mail-content.tsx:35-37`) — good.

---

## §6. Performance Audit

### 6.1 Bundle Analysis

- No `@next/bundle-analyzer` configured (`next.config.mjs`). 🟡
- Aggressive **manual `splitChunks`** cache groups: react-vendors, radix-ui, redux, forms, common (`next.config.mjs:37-95`). `output: 'standalone'`, `compress: true`, `productionBrowserSourceMaps: false`.
- **Lazy-loaded heavies**: CKEditor (`compose/compose.tsx:17-21` via a `createLazyImport`), `LazyCalendarView` (`calendar-view-lazy.tsx`, `ssr:false`), `LazyEventForm` (`event-form-lazy.tsx`, `ssr:false`), and ~12 settings form cores (`lazy(() => import('…-core'))`). `components/dynamic-imports.tsx` itself is mostly commented examples + one helper.
- 🟡 `react-virtualized` (legacy) pulled in for a single folder picker; consider `react-window`.

### 6.2 Rendering Strategy

Almost everything is **CSR** — the entire `(loggedin)` tree is `'use client'`, gated on a client token. The root layout is a Server Component (`app/layout.tsx`) but immediately renders `StoreProvider` (client). 

| Route | Strategy | Optimal? |
|-------|----------|----------|
| `(auth)/*` | CSR (client forms) | 🟡 acceptable |
| `(loggedin)/*` (mail/cal/tasks/contacts/settings) | CSR | 🟡 SSR not viable given client token + Web Storage auth; would improve with cookie auth |
| `admin_panel/*` | CSR | 🟡 |
| `(others)/compose` | CSR | ok |

No sensitive data is SSR'd (auth is client-side), so there is no over-exposure; but there is **no SSR/streaming benefit** for first paint. Adopting cookie auth would unlock RSC/SSR for the shell.

### 6.3 RTK Query Cache Strategy

- `getMail` `keepUnusedDataFor` default; mail message list `keepUnusedDataFor: 60` (`mails-api.ts:464`); profile `300` (`profile-api.ts:40`); `auth/mode` `0` (`auth.api.ts:42`); `system` `3600` (`auth.api.ts:48`); SSE query `Infinity` (`sse-api.ts:62`). Reasonable.
- Optimistic updates: mark-as-read and seen toggles (mail), attendance cache patch (calendar), task completion. No pessimistic-only mutations that should be optimistic stand out.
- **No polling** anywhere (mail relies on the broken SSE for freshness). 🟡 Until SSE works, mail/calendar are stale until manual refetch.

### 6.4 React Performance

- Memoization is **selective, not systematic**: ≈35 `memo`, ≈58 `useMemo`, ≈52 `useCallback`, concentrated in calendar/mail/admin/tasks.
- 🟡 **`reactStrictMode: false`** (`next.config.mjs:10`) hides effect/cleanup issues in dev.
- Large lists: mail list and contact list are **not virtualized** (only the folder picker uses `react-virtualized`). 🟡
- Images: `next/image` used in only 2 places (`login layout`, a sidebar); **no raw `<img>`** in production JSX (mail body images are inside sanitized HTML). `next/font` (Geist + local OpenDyslexic) via `lib/fonts.ts`. ✅

### 6.5 Web Vitals Risks

- **LCP**: CSR shell + lazy calendar/editor can delay first meaningful paint; mail list first load depends on `/env` resolution (up to 8s timeout, `api-slice.ts:88`) before any request fires. 🟡
- **CLS**: skeletons exist for most lists (good); risk from late font swap and dynamically inserted toolbars.
- **INP**: heavy components (`multi-select.tsx` ≈1230 L, `event-form.tsx` ≈1040 L, `timeline-freebusy.tsx` ≈772 L) and non-virtualized lists can cause jank on interaction. 🟡

---

## §7. Code Quality & Technical Debt

### 7.1 Component Architecture & God Components

Top files by size (`src/features` + `src/components`):

| Lines | File |
|------:|------|
| ≈1230 | `components/ui/multi-select.tsx` |
| ≈1040 | `features/calendars/components/event-form.tsx` |
| ≈878 | `features/mails/store/mails-api.ts` |
| ≈866 | `features/calendars/store/calendars-api.ts` |
| ≈826 | `components/ui/sidebar.tsx` |
| ≈772 | `features/calendars/components/timeline-freebusy.tsx` |
| ≈513 | `features/calendars/components/sidebar/forms/calendar-form-core.tsx` |
| ≈442 | `features/calendars/components/visualization/index.tsx` |
| ≈406 | `features/calendars/hooks/useCalendarState.ts` |
| ≈397 | `app/[locale]/(loggedin)/calendars/page.tsx` |

`EventForm`, `MultiSelect`, `TimelineFreeBusy`, `useCalendarState` mix rendering, data, and mutation logic — split candidates.

### 7.2 Custom Hooks Quality

| Hook | File | Cleanup | Notes |
|------|------|---------|-------|
| `useEventListener` | `hooks/use-event-listener.ts:19-74` | ✅ `removeEventListener` (`:64-70`) | typed via `any` overloads |
| `useUnmount` | `hooks/use-unmount.ts:4-13` | ✅ | |
| `useMediaQuery` | `hooks/useMediaQuery.ts:6-36` | ✅ `useSyncExternalStore` unsubscribe | |
| `useIsMobile` | `hooks/use-mobile.tsx:5-18` | ✅ | 🟡 **duplicates** `useMediaQuery` |
| `useHover` / `useHover` | `hooks/use-hover.ts`, `hooks/useHover.ts` | — | 🟡 two files, mixed naming |
| `useAvatarSource` | `user-profile/hooks/use-avatar-source.ts:39-107` | ✅ `cancelled` flag for async hash | |
| `useCalendarState` | `calendars/hooks/useCalendarState.ts` | effect-based sync, no global timers | 🟡 god-hook (~406 L) |
| `useFolderMessages` | `mails/hooks/use-folder-messages.ts:32-88` | dispatch in effect, deps `[data,…]` | |
| `usePermissions` | `hooks/use-permissions.ts` | — | 🟡 reads non-existent `settings.permissions` (dead) |

No obvious missing-cleanup memory leaks in listeners/timers; the SSE service manages its own timeouts (`sse-service.ts`).

### 7.3 Dead Code

- `lib/auth/getSessionUser.ts` — **entirely commented** (server-auth scaffolding, unused).
- `components/dynamic-imports.tsx:13-28` — commented examples.
- `user-preferences-api.ts:58-66` — commented mutation; `general/index.tsx:9-12` commented.
- `address-books-api.ts` — `addVCardToAddressBook`/`deleteVCardFromAddressBook` defined but not exported/used.
- `fakeApi/settings/mail/imap-accounts/route.ts` — legacy CRUD, not referenced by feature code.
- `list/list-header.tsx`, calendar `skeletons/list-skeleton.tsx`, mail `visualization-skeleton.tsx` — orphaned.
- Admin `useGetSystemQuery` — exported, never imported.
- TODO/FIXME: mail (`list.tsx:26,45`, `list-toolbar.tsx:91-95`), admin (`admin-form-page-skeleton.tsx:5`, `use-domain-config.ts:319,323`), settings types (`user-preferences-types.ts:46-51`). **None** in `features/calendars`/`features/tasks`.

### 7.4 Consistency Audit

- **Styling**: Tailwind v4 + `cn()` + CVA, consistent. Mail body uses a one-off Shadow-DOM `<style>` (justified). No CSS-modules/styled-components mix except `compose.module.css`.
- **Imports**: `@/` alias used consistently.
- **Async**: `async/await` throughout; minimal `.then()` (env-service, useEnvVars).
- **Error handling**: inconsistent — RTK notifications (mail/calendar/tasks) vs `alert()` (admin) vs hardcoded `'ERROR'` strings (settings) vs `return null`/swallowed (mail viewer, contact viewer). 🟡
- **Loading states**: mostly skeletons, but several screens differ (`PageLoader` vs `Skeleton` vs spinner vs none for the calendar grid). 🟡

### 7.5 2026 React/Next.js Best-Practice Gaps

- **React 19 features**: `use()`, `useOptimistic`, `useFormStatus`, Server Actions — **not adopted**. Forms use RHF + RTK Query mutations.
- **Server Components**: minimal; the app is effectively client-rendered (cookie-auth would unlock RSC).
- **Server Actions**: none; all writes via RTK Query.
- **Turbopack**: enabled for dev (`next dev --turbopack`, `package.json:8`); build uses default.
- **Suspense/ErrorBoundary**: lazy components use `loading` fallbacks; **no explicit `<ErrorBoundary>`** around critical sections — errors fall back to `return null` or notifications. 🟡
- **`React.StrictMode`**: **disabled** (`next.config.mjs:10`). 🟡

---

## §8. Testing Analysis

> Note: `jest.config.ts` and `eslint.config.mjs` are blocked by `.cursorignore` from the indexer but were read directly. Test counts are ripgrep approximations.

### 8.1 Coverage

- **Framework**: Jest 30 + React Testing Library 16 + user-event (delay nulled in `jest.setup.ts:11-13`), `jsdom`. Config via `next/jest` (`jest.config.ts`): `collectCoverage:true`, v8 provider, `setupFilesAfterEnv: jest.setup.ts`, `moduleNameMapper` for `@/` and next-intl, `ts-jest` + `babel-jest`. **No Playwright/Cypress (no E2E), no MSW.**
- **Volume**: ≈**353 test files**, ≈**3,400–3,500** `it/test` cases. Per area (files): mails 69, components ≈95, user-settings 39, calendars 39, app 24, lib 24, tasks 20, hooks 11, address_books 10, user-profile 6, notifications 5, auth 4, admin-panel 3.
- **Not tested**: anything wired to unimplemented backends (compose send, external accounts CRUD, contacts persistence); auth expiry/refresh edge cases; the client-only route guard end-to-end; admin authz; most error/empty states for settings (which use hardcoded `'ERROR'`).

### 8.2 Test Quality

- Mostly **behavioral** (`getByRole`, user-event). API mocking is **manual** `jest.mock` of RTK Query hooks and `next/navigation` (e.g. `use-folder-messages.test.ts:8-26`), not MSW — so HTTP contracts are never exercised. `src/__mocks__/` has a single `matchMedia.mock` (overlaps `jest.setup.ts`).
- **Snapshots**: 29 `.snap` files (mostly `components/ui`), ≈35–40 `toMatchSnapshot` — limited, mostly meaningful UI snapshots.
- Lazy CKEditor is tested by reading source (file-structure assertions), explicitly acknowledging the lack of E2E.

### 8.3 Missing Test Infrastructure

- 🔴 No **MSW** → no realistic API-contract tests; mismatches with the marshmallow schemas (→ BACKEND §3) go undetected.
- 🔴 No **E2E** (Playwright/Cypress) → login→mail→logout, compose, calendar CRUD flows uncovered end-to-end.
- 🟡 No **jest-axe**/a11y assertions.
- 🟡 No visual-regression or performance-budget tests.

---

## §9. Accessibility Audit

- **`eslint-plugin-jsx-a11y`**: not a direct dependency, but **`next`/`next/core-web-vitals` is extended** in `eslint.config.mjs`, which bundles jsx-a11y rules — so a11y linting is **partially active transitively**. No explicit a11y rule customization. `react/jsx-no-literals` is `"warn"` (not error) and builds ignore lint anyway (§1.1).
- **ARIA/roles**: ≈55 files use `aria-label`, ≈15 use `role=`. Good examples: `CalendarToolbar` prev/next icon buttons have i18n `aria-label` (`calendar-toolbar.tsx:85-106`); password input wires `aria-invalid`/`aria-describedby` (`login-auth-form.tsx:185-186`); `@radix-ui/react-accessible-icon` is available.
- **Gaps**: no explicit focus trap (delegated to Radix Dialog/Popover — generally OK); some icon-only triggers lack labels (`ThemeSwitcher` collapsible chevron `theme-switcher.tsx:49-51`; generic `Button size="icon"` imposes no label). Some labels use `title=` (e.g. calendar/contacts sidebar skeletons) rather than `aria-label`.
- **Screen-reader for mail list / calendar grid**: relies on react-big-calendar and plain lists; not explicitly audited — `NON VERIFIED — requires runtime check` (axe/manual).
- **Skip links**: none found. **Focus management on route transitions**: not implemented (client navigation).

---

## §10. Backend↔Frontend Integration Gaps (Critical)

Base prefixes (→ BACKEND §3): user `/api/user/v1`, admin `/api/admin/v1`. Frontend base URL = `REACT_APP_API_BASE_URL` or `/fakeApi` (`api-slice.ts:102`).

### Backend endpoint → Frontend call

| Backend endpoint | FE call | Status | Gap |
|------------------|---------|--------|-----|
| `GET /system` | `authApi.getSystem` (`auth.api.ts:45`) | ✅ | — |
| `GET /auth/mode` | `getAuthMode` (`auth.api.ts:36`) | ✅ | backend plain-only |
| `POST /auth/login` | `login` (`auth.api.ts:28`) | ✅ | backend user source mocked |
| `GET /auth/callback/<domain>` | — | ❌ both | no UI route; backend `NotImplementedError` |
| `GET /profile` | `getUserProfile` (`profile-api.ts:17`) | ✅/🔜 | backend partial |
| `GET /preferences` | `getUserPreferences`, `getPreferences` (×2) | ✅ | two FE shapes (§2.3) |
| `PATCH /preferences` | granular mutations + flat mutation | ✅/🟡 | `app-data` flat body mismatched |
| `GET /preferences/<type>` | — | ❌ both | backend commented |
| `GET /mailboxes/<id>/folders` | `getFolders` (`mails-api.ts:447`) | ✅ | — |
| `POST .../folders` | `createFolder` | ✅ | — |
| `GET/DELETE .../folders/<f>` | `getFolderShare`/`deleteFolder` etc. | ✅ | — |
| `PATCH .../folders/<f>` | — | ❌ both | backend `NotImplementedError` |
| `POST .../folders/<f>/expunge|purge` | `expungeFolder`/`purgeFolder` | ✅ | — |
| `POST .../folders/<f>/export` | — | ❌ | backend `NotImplementedError`; no UI |
| `GET/POST .../folders/<f>/share` | `get/setFolderShare` | ✅ | — |
| `GET .../mails` | `getFolderMessages` | ✅ | pagination via `X-Pagination` header |
| `POST .../mails/batch-action` | — (`console.log` TODO) | ❌ both | bulk toolbar inert |
| `GET .../mails/<uid>` | `getMail` | ✅ | — |
| `DELETE .../mails/<uid>` | `moveToTrash` | ✅ | — |
| `POST .../mails/<uid>/action` | `mailAction` | ✅ | tag/untag/move/spam/ham/copy |
| `POST .../mails/<uid>/download` | (download via URI in attachments) | 🔜 | `NON VERIFIED` exact wiring |
| `POST .../mails/<uid>/reply` | — | ❌ both | viewer reply button inert |
| `POST .../mails/<uid>/forward` | — | ❌ both | inert |
| `GET .../mails/<uid>/raw` | — | ❌ | no UI |
| `GET /mailboxes` (list) | `getUserMailboxes` (`mailboxes-api.ts:37`) | ⚠️ | backend `NotImplementedError`; fakeApi GET only |
| `POST /mailboxes` | `createUserMailbox` | ❌ both | external account create fails |
| `GET /mailboxes/<id>` | `getUserMailbox` | 🔜 | backend partial |
| `PATCH /mailboxes/<id>` | `updateUserMailbox(Profile)`; profile identities | ❌ both | `NotImplementedError`; fakeApi lacks route |
| `DELETE /mailboxes/<id>` | `deleteUserMailbox` | ❌ both | |
| `POST /mailboxes/<int:account_id>/compose` | — | ❌ both | **no FE compose call**; backend `NotImplementedError`; note `<int>` vs `<string>` (→ BACKEND §6.4) |
| `GET/POST /mailboxes/<id>/delegate` | — | ❌ both | no UI |
| `POST /mailboxes/<id>/purge` | (folder purge used instead) | n/a | |
| `GET/POST /calendars`, `/calendars/<key>` | `getCalendars`/`createCalendar`/`get/update/deleteCalendar` | ✅ | — |
| `GET /calendars/<key>/export` | — | ❌ | export is WIP stub in UI |
| `POST/DELETE /calendars/<key>/subscription` | — | ❌ | UI builds `/calendars/<id>/subscribe` link, not token (mismatch) |
| `GET /public/calendars/<token>` | — | ❌ | public token URL not generated by FE |
| `POST /calendars/<key>/import` | — | ❌ | no import UI found (`NON VERIFIED`) |
| `GET/POST /calendars/<key>/events`, `GET /events`, `GET/PATCH/DELETE /events/<key>` | events CRUD + `getEvents`/`getEventsInTimeRange`/`searchEvents` | ✅ | param names `NON VERIFIED` |
| `POST /events/<key>/attendance` | `postEventAttendance` | ✅ | iMIP REPLY built but not sent (backend) |
| `POST /freebusy` | `getFreeBusy` | ✅ | — |
| `GET /reminders` | — | ❌ | no FE consumer found |
| `GET/POST /calendars/<key>/tasks`, `GET /tasks`, `GET/PATCH/DELETE /tasks/<key>` | tasks CRUD | ✅ | — |
| `GET/POST /external-calendars`, `<key>`, `<key>/sync` | external-calendar CRUD+sync | ✅ | — |
| `GET /admin/v1/config/dynamic-form|system|domain-default|domains|rules` (+ CRUD) | admin-panel-api | ✅ | base-prefix risk (§2.5); no authz (backend) |
| `GET /users/active`, `POST /users/revoke`, `POST /users/inactive` | — | ❌ | **no admin sessions UI** |

### Frontend call → no matching backend

| FE call | Backend? | Note |
|---------|----------|------|
| `GET users/search` (`calendars-api.ts:39,776`) | ❌ none | attendee autocomplete has no backend route |
| `GET/PATCH settings/mail/filters` | ❌ | Sieve 0% (fakeApi only) |
| `GET/PATCH settings/mail/vacation` | ❌ | Sieve 0% |
| `GET/PATCH settings/mail/forward` | ❌ | Sieve 0% |
| `GET/PATCH settings/mail/notifications` | ❌ | Sieve 0% |
| `GET/PATCH settings/mail/labels` | ❌ | fakeApi only |
| `GET settings/general`, `settings/address_books` | ❌ | preferences-based on backend; FE settings hit fakeApi paths |
| `GET customization/themes` (`themes-api.ts:7`) | ❌ | fakeApi only |
| `address_books*` (all) | ❌ | contacts 0% backend |
| `${origin}/api/sse`, `localhost:8888/sse` | ❌ | SSE 0% backend |

### Specific risks investigated

- **`<int:account_id>` vs `<string>`**: the FE never calls `compose`, and all other mailbox paths pass account id as a **string** (`mails-api.ts:230` default `'0'`). If/when compose is wired, the backend `<int>` route (→ BACKEND §6.4) would reject `'0'`-style strings unless coerced.
- **`get_mailbox_quota`**: implemented in backend module but unexposed (→ BACKEND §3.1). FE makes **no** quota call. No gap to close on FE until a route exists.
- **Public calendar token URL**: FE builds `${origin}/calendars/${id}/subscribe` (`sidebar/actions/link.tsx:14-28`) — **wrong**: it uses the calendar id, not `share_token`, and a path the backend does not serve (backend public route is `/public/calendars/<token>`). 🔴 Mismatch.
- **iMIP attendance**: FE sends PARTSTAT via `postEventAttendance` and shows success; the backend builds but **does not send** the REPLY email (SMTP unwired, → BACKEND §3.1). Users will believe organizers were notified.
- **SSE**: FE opens a native `EventSource` to a backend with **0% SSE**; it errors, retries 3×, and gives up silently (`sse-service.ts:197-264`). The mail:received cache-invalidation listener never fires.

---

## §11. UI/UX Completeness vs. SOGo Standards

| Feature | SOGo 5 | Current UI | Gap / Effort |
|---------|--------|------------|--------------|
| Mail read/list/folders | ✅ | ✅ | — |
| Mail compose (rich text) | ✅ | 🔜 UI shell only, **no send** | Wire send + CKEditor↔Redux body; **L** (blocked on backend) |
| Mail reply/forward | ✅ | ❌ inert buttons | **M** (blocked) |
| Mail signatures | ✅ | ❌ | **M** |
| Mail filters (Sieve) | ✅ | 🔜 UI → fakeApi | **L** (needs backend) |
| Vacation auto-reply | ✅ | 🔜 UI → fakeApi | **M** (needs backend) |
| Mail threading/conversation | ✅ | ❌ | **L** |
| Mail search (server) | ✅ | 🔜 UI popover, no server search | **M** |
| Calendar month/week/day | ✅ | ✅ (+ custom agenda, mobile) | — |
| Recurring event editor (RRULE) | ✅ | 🔜 FREQ/INTERVAL/BYDAY/BYMONTHDAY/UNTIL/COUNT | add BYSETPOS/BYMONTH/etc.; **M** |
| Meeting invite accept/decline | ✅ | ✅ (no email sent, backend) | — |
| FreeBusy / scheduling | ✅ | ✅ | — |
| Calendar sharing / ACL | ✅ | ❌ WorkInProgress stub | **L** |
| Public calendar URL | ✅ | ⚠️ wrong URL scheme | **S** fix |
| Contact book (CardDAV) | ✅ | 🔜 fakeApi, partial UI, no create form | **XL** (no backend) |
| Address autocomplete in compose | ✅ | ❌ (compose itself inert) | **M** |
| Task management | ✅ | ✅ | — |
| Notes | ✅ | ❌ "coming soon" | **M** |
| Admin panel | ✅ | 🔜 config/domains/rules; no users/sessions UI | **M** |
| Dark mode | N/A | ✅ (+ dyslexia & color-blind themes) | — |
| Mobile responsive | Partial | ✅ dedicated mobile calendar/mail views | — |
| Offline / PWA | ❌ | ❌ | n/a |
| Real-time (push) | ✅ (SOGo ActiveSync/EAS) | 🔜 SSE client built, backend 0% | **L** |
| i18n | ✅ multi | 🔜 next-intl wired but only `en` messages; login langs hardcoded `['en']` | **M** add locales |

---

## §12. Prioritized Frontend Roadmap

| Priority | Initiative | Blocks prod? | Effort | Business value | Backend dependency |
|----------|-----------|--------------|--------|----------------|--------------------|
| 🔴 P0 | Move JWT to httpOnly cookie; remove Web-Storage token; memory-only fallback | Yes | M | Security | cookie issuance |
| 🔴 P0 | Add server/middleware auth guard for `(loggedin)`/`admin_panel` | Yes | M | Security | — |
| 🔴 P0 | Re-enable `ignoreBuildErrors:false` + ESLint in CI; commit lockfile + `npm audit` | Yes | S | Reproducibility/safety | — |
| 🔴 P0 | Replace regex sanitizer with DOMPurify or sandboxed iframe for mail HTML | Yes | S | XSS | — |
| 🔴 P0 | Remove `LOGIN_PREFILL_PASSWORD` from `/env` outside dev | Yes | S | Secret exposure | — |
| 🟡 P1 | Global 401 interceptor + token-expiry handling (`baseQuery` wrapper) | Partial | M | Session correctness | — |
| 🟡 P1 | Wire outbound mail (compose/reply/forward → send) + CKEditor↔Redux body | Partial | L | Webmail usable | backend compose/reply/forward |
| 🟡 P1 | Guard/disable UIs pointing at unimplemented backends (external accounts, identities, Sieve settings) until ready | Partial | S | Avoid false success | — |
| 🟡 P1 | Consolidate the two `/preferences` APIs | Partial | S | Data-shape correctness | — |
| 🟡 P1 | Fix public-calendar URL to use `share_token` + `/public/calendars/<token>` | Partial | S | Sharing works | — |
| 🟡 P1 | Replace `alert()`/`'ERROR'`/`return null` with consistent error+empty states + ErrorBoundary | Partial | M | UX/observability | — |
| 🟢 P2 | Virtualize mail + contact lists (`react-window`/TanStack Virtual) | No | M | Perf at scale | — |
| 🟢 P2 | Add CSP + security headers; strip dev `console.*`; add `eslint-plugin-jsx-a11y` | No | M | Hardening/a11y | — |
| 🟢 P2 | MSW-based contract tests + Playwright E2E (login/mail/calendar) + jest-axe | No | M | Regression safety | — |
| 🟢 P2 | Split god components (`event-form`, `multi-select`, `timeline-freebusy`, `useCalendarState`) | No | M | Maintainability | — |
| 🟢 P2 | Re-enable `reactStrictMode`; adopt `<Suspense>`/`ErrorBoundary` | No | S | Correctness | — |
| 🔵 P3 | Real Contacts UI (create/edit forms) once CardDAV backend lands | No | XL | SOGo parity | contacts backend |
| 🔵 P3 | SSO callback route + token exchange | No | L | Enterprise | backend callback |
| 🔵 P3 | Notes module | No | M | Parity | backend |
| 🔵 P3 | Fix SSE (correct endpoint/token; align with backend once SSE exists) | No | M | Real-time | backend SSE |
| 🔵 P3 | Extend RRULE editor (BYSETPOS/BYMONTH/BYWEEKNO); admin Users/Sessions UI; full i18n locales | No | M | Feature depth | — |

---

## Appendix A — Dev artifacts / fixtures to remove before prod

- `LOGIN_PREFILL_EMAIL/PASSWORD` served by `app/env/route.ts:14-21` (gate behind `NODE_ENV`).
- `DEFAULT_TEAM_MEMBERS` / `SAMPLE_API_DATA` FreeBusy demo data (`features/calendars/components/utils.ts:53-130`).
- `console.*` left in production paths (`env-service.ts`, `lib/redux/sse/*`, `calendars-api.ts`, `list-toolbar.tsx`, `error-handlers.ts:43`, …).
- Orphan/stub components: `list/list-header.tsx`, calendar `skeletons/list-skeleton.tsx`, mail `visualization-skeleton.tsx`.
- Dead code: `lib/auth/getSessionUser.ts` (commented), `fakeApi/settings/mail/imap-accounts/route.ts` (legacy), unexported vCard mutations, `use-permissions.ts` (broken).
- `next.config.mjs:5-17` build-time `ignoreBuildErrors`/`ignoreDuringBuilds`.

## Appendix B — Inconsistencies / functional bugs observed

- Two `/preferences` API shapes (`user-settings` `{settings}` vs `app-data` flat) — `app-data` incompatible with backend (`app-data/store/user-preferences-api.ts:11-21`).
- Duplicate `getSystem` RTK endpoint name (auth vs admin) with `overrideExisting:false` (`auth.api.ts:45`, `admin-panel-api.ts:25`).
- Public calendar link uses calendar `id` + `/subscribe` path instead of `share_token` + `/public/calendars/<token>` (`sidebar/actions/link.tsx:14-28`).
- Mail viewer/contact viewer swallow errors with `return null` (`[mail_id]/page.tsx:73`; `@visualization/[contact_id]/page.tsx:18-20`).
- SSE prod config reads `localStorage.getItem('auth_token')` (never written; token is `sogo_auth`) (`sse-config.ts:75`).
- `themes-api.ts:6` types a JSON response as `CSSStyleSheet`.
- Mail labels settings route exists but is missing from the settings sidebar.
- `formatMailTime` hardcoded to `'fr-FR'` (`mail/utils.ts:26`); login languages hardcoded `['en']` (`login-form.tsx:34`).
- Compose Save/Send and viewer reply/forward buttons have no handlers (entirely inert).
