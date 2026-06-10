<div align="center">

<img src="https://repository-images.githubusercontent.com/5855873/5d968e00-974b-11e9-9164-8e2f910bffbe" alt="SOGo" width="640" />

# SOGo 6 — Web Frontend

**A modern webmail and groupware client (Next.js 15) for the [SOGo](https://www.sogo.nu/) server.**

[Prerequisites](#prerequisites) · [Quick start](#quick-start) · [Configuration](#configuration) · [Scripts](#scripts) · [Contributing](#contributing)

</div>

---

> **Private repository (for now)** — this README is aimed at **developers** joining the project. It will be expanded and polished before any public release.

## Overview

Modern web client (App Router, React 19, strict TypeScript) for mail, calendars, address books, and part of administration. API calls use a configurable base URL; in development, if the real backend is unreachable, the app may fall back to **mock** routes under `/fakeApi`.

For **coding conventions**, the `src/` layout, and detailed commands, see **[`AGENTS.md`](./AGENTS.md)**.

## Prerequisites

- **Node.js** ≥ 18
- **VS Code** + [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension _(recommended, matches team setup)_
- A reachable **SOGo** (or compatible) instance on your machine, _optional_ if you work only against the mock API

## Quick start

### 1. Clone and install

```bash
git clone <repository-url>   # URL provided by the team (private repo)
cd <project-folder>
npm install
```

### 2. Environment variables

There is no `.env.example` at the repo root: copy or adapt existing config from the team.

- In a **dev container** / local dev, **`.env.development`** (already present or created from the team template) supplies Next.js defaults.
- You can add **`.env.local`** (gitignored) to **override** without changing shared files.

After any change to `.env*`, **restart** `npm run dev`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Mock API:** if the real API is unavailable, client-side logic may use **`/fakeApi`** (Next.js routes, in-memory data). You can force that mode by serving `REACT_APP_API_BASE_URL=/fakeApi` from `/env` (see `src/app/env/route.ts` and `src/lib/env-service.ts`).

## Configuration

### Main variables

| Variable                    | Notes                                                                                                                                                               |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `REACT_APP_API_BASE_URL`    | User API base URL (e.g. `http://localhost:5000/api/user/v1/`). If missing or backend unreachable in dev, the app may switch to `/fakeApi`.                          |
| `REACT_APP_API_URL`         | Optional secondary URL (see `/env`).                                                                                                                                |
| `NEXT_PUBLIC_ADMIN_DOMAINS` | Comma-separated admin hostnames. Server default if unset: `admin.localhost`.                                                                                        |
| `SSE_ENABLED`               | Exposed via `/env`: **`true` when the variable is unset**; only the string **`false`** explicitly disables SSE.                                                     |
| `LOGIN_PREFILL_EMAIL`       | Prefills the email field on **`/auth/login`** (optional). Read at **runtime** by `GET /env` — works with container env (e.g. Rancher) without rebuilding the image. |
| `LOGIN_PREFILL_PASSWORD`    | Prefills the password on **`/auth/login/pwd`** (same as above).                                                                                                     |

`GET /env` also falls back to legacy `NEXT_PUBLIC_LOGIN_PREFILL_EMAIL` / `NEXT_PUBLIC_LOGIN_PREFILL_PASSWORD` on the **server** if the `LOGIN_*` vars are unset (local `.env` compatibility).

### Login prefill (dev / QA)

Sign-in is two steps: email (`/auth/login`) then password (`/auth/login/pwd`).

Prefill values are loaded from **`/env`** after the app starts. Set them on the **server** / container, for example:

```env
LOGIN_PREFILL_EMAIL=sogo-tests1@example.org
LOGIN_PREFILL_PASSWORD=sogo
```

- They must **match the account** you use on **your** SOGo instance (not read from SOGo automatically).
- Anyone who can call **`/env`** can read these strings — use only for **dev / demo / disposable** accounts.

Implementation: `src/app/env/route.ts` (exposure) and `src/features/auth/components/login-form.tsx` / `login-auth-form.tsx` (apply after `useEnvVars`).

## Multi-domain routing

| Type                                      | Behavior                                   |
| ----------------------------------------- | ------------------------------------------ |
| **User domain** (e.g. `localhost`)        | Full app; `/admin_panel` is not available. |
| **Admin domain** (e.g. `admin.localhost`) | Experience centered on `/admin_panel`.     |
| **Login** `/auth/login`                   | Available on both domain types.            |

### Local example

In `/etc/hosts`:

```
127.0.0.1 localhost
127.0.0.1 admin.localhost
```

In `.env.local` or `.env.development`:

```env
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost
```

- User UI: http://localhost:3000
- Admin UI: http://admin.localhost:3000

## Scripts

| Command                      | Purpose                                   |
| ---------------------------- | ----------------------------------------- |
| `npm run dev`                | Dev server (Turbopack, port 3000)         |
| `npm run build`              | Production build (`output: 'standalone'`) |
| `npm run start`              | Next.js server after build                |
| `npm run lint`               | ESLint on `src`                           |
| `npm run type-check`         | `tsc` (no emit)                           |
| `npm test`                   | Jest suite                                |
| `npm run test:fast`          | Jest, fast path without coverage          |
| `npm run test:watch`         | Jest watch mode                           |
| `npm run test:coverage`      | Jest with coverage                        |
| `npm run test:changed`       | Tests related to changed files            |
| `npm run check:translations` | Translation key checks                    |

> **Build:** `next.config.mjs` currently allows production builds to **succeed** despite TypeScript and ESLint issues (`ignoreBuildErrors` / `ignoreDuringBuilds`). Before opening a PR, run **`npm run type-check`** and **`npm run lint`** manually.

## Testing

```bash
npm test
npm run test:fast
npm run test -- --watch
```

The suite covers Redux slices, RTK Query endpoints, components, hooks, and some snapshots.

## Contributing

1. Read **[`AGENTS.md`](./AGENTS.md)** (repo layout, i18n, Redux, file naming, etc.).
2. There is no `CONTRIBUTING.md` yet; team norms live in `AGENTS.md` and code review.

## License

[GPL-3.0 License](./LICENSE)
