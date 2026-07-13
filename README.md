<div align="center">

# SOGo 6 — Web Frontend

**A modern webmail and groupware client (Next.js 16) for the [SOGo 6](https://www.sogo.nu/) API.**

SOGo 6 is a new iteration with a total overhaul. The SOGo 5 codebase is available [here](https://github.com/Alinto/sogo).

[Prerequisites](#prerequisites) · [Quick start](#quick-start) · [Backend](#backend) · [Configuration](#configuration) · [Docker deployment](#docker-deployment) · [Scripts](#scripts) · [Contributing](#contributing)

</div>

---

## Overview

Modern web client (App Router, React 19, strict TypeScript) for mail, calendars, address books, and part of administration. It talks to the **SOGo 6 backend** over HTTP (`/api/user/v1`, etc.) — not the legacy SOGo 5 UI stack.

In **development**, if the real backend is unreachable, the app may fall back to **mock** routes under `/fakeApi`. In **production**, a missing or invalid API configuration surfaces as an error (no silent mock fallback).

For **coding conventions**, the `src/` layout, and detailed commands, see **[`AGENTS.md`](./AGENTS.md)**.

## Prerequisites

- **Node.js** ≥ 22 (24 recommended; matches the production Docker image)
- **VS Code** + [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension _(optional, matches team setup)_
- **[SOGo 6 server](https://github.com/Alinto/SOGo6-server)** on your machine, _optional_ if you work only against the mock API

## Backend

This repository is **frontend only**. It requires the SOGo 6 API server:

| Repository | Role |
| ---------- | ---- |
| **[Alinto/SOGo6-server](https://github.com/Alinto/SOGo6-server)** | Flask API, default port **5000**, base path **`/api/user/v1`** |
| **This repo (SOGo6-UI)** | Next.js UI, port **3000** |

Typical local API URL: `http://127.0.0.1:5000/api/user/v1`

See the server repository for PostgreSQL, Redis, LDAP, and mail stack setup. For dev-container networking hints, see [`docs/DEV_CONTAINER_API_SETUP.md`](./docs/DEV_CONTAINER_API_SETUP.md).

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/Alinto/SOGo6-UI.git
cd SOGo6-UI
npm install
```

SSH:

```bash
git clone git@github.com:Alinto/SOGo6-UI.git
```

### 2. Environment variables

Copy **`.env.example`** to **`.env.development`** or **`.env.local`** and adjust values.

- In local dev, **`GET /env`** serves defaults when vars are unset: API → `http://127.0.0.1:5000/api/user/v1`, SSE off in development unless `SSE_ENABLED=true`.
- Add **`.env.local`** (gitignored) to override without changing shared files.

After any change to `.env*`, **restart** `npm run dev`.

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Mock API:** if the real API is unavailable in development, client-side logic may use **`/fakeApi`** (Next.js routes, in-memory data). Force mock mode with `REACT_APP_API_BASE_URL=/fakeApi` (see `src/app/env/route.ts` and `src/lib/env-service.ts`).

## Configuration

### Main variables

| Variable | Notes |
| -------- | ----- |
| `REACT_APP_API_BASE_URL` | User API base URL (e.g. `http://127.0.0.1:5000/api/user/v1`). Dev default from `/env` if unset. If unreachable in **development**, the app switches to `/fakeApi`. Calls go **directly** to the backend (no Next.js proxy). **Required in production.** |
| `REACT_APP_API_URL` | Reserved in `/env`; not used by the UI today. |
| `NEXT_PUBLIC_ADMIN_DOMAINS` | Comma-separated admin hostnames. Server default if unset: `admin.localhost`. |
| `SSE_ENABLED` | In **development**, SSE is **off** unless set to `true`. In production, enabled when unset; set to `false` to disable. |
| `LOGIN_PREFILL_EMAIL` | Prefills the email field on **`/auth/login`** (optional). Read at **runtime** by `GET /env`. |
| `LOGIN_PREFILL_PASSWORD` | Prefills the password on **`/auth/login/pwd`** (same as above). |

`GET /env` also falls back to legacy `NEXT_PUBLIC_LOGIN_PREFILL_EMAIL` / `NEXT_PUBLIC_LOGIN_PREFILL_PASSWORD` on the **server** if the `LOGIN_*` vars are unset (local `.env` compatibility).

### Security: `GET /env`

**`/env` is unauthenticated.** Anyone who can reach the frontend can read its JSON response. Do **not** put production secrets there. Use `LOGIN_PREFILL_*` only for dev, demo, or disposable accounts.

### Login prefill (dev / QA)

Sign-in is two steps: email (`/auth/login`) then password (`/auth/login/pwd`).

```env
LOGIN_PREFILL_EMAIL=sogo-tests1@example.org
LOGIN_PREFILL_PASSWORD=sogo
```

- Values must **match an account on your SOGo 6 instance** (not fetched from the server automatically).
- Readable by anyone who can call **`/env`**.

Implementation: `src/app/env/route.ts`, `src/features/auth/components/login-form.tsx`, `login-auth-form.tsx`.

## Multi-domain routing

| Type | Behavior |
| ---- | -------- |
| **User domain** (e.g. `localhost`) | Full app; `/admin_panel` is not available. |
| **Admin domain** (e.g. `admin.localhost`) | Experience centered on `/admin_panel`. |
| **Login** `/auth/login` | Available on both domain types. |

### Local example

`/etc/hosts`:

```
127.0.0.1 localhost
127.0.0.1 admin.localhost
```

`.env.local` or `.env.development`:

```env
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost
```

- User UI: http://localhost:3000
- Admin UI: http://admin.localhost:3000

## Docker deployment

Production image: root **`Dockerfile`** (`output: 'standalone'`, Node 24, port **3000**).

> **`Dockerfile.static`** is a legacy static-export experiment and is **not** compatible with the current app (proxy, `/env`, `/fakeApi`). Use the main **`Dockerfile`** only.

Environment files (`.env.development`, `.env.local`) are **not** baked into the image — configure at **container start** (same variables as [Configuration](#configuration), exposed via **`GET /env`**).

### Build

```bash
docker build -t sogo-ui .
```

Optional: `docker build --build-arg NODE_VERSION=24 -t sogo-ui .`

### Required runtime variables

| Variable | Production example | Notes |
| -------- | ------------------ | ----- |
| `REACT_APP_API_BASE_URL` | `/api/user/v1` | **Required.** URL the **browser** uses (relative behind a reverse proxy, or absolute). |
| `NEXT_PUBLIC_ADMIN_DOMAINS` | `admin.example.com` | Recommended; defaults to `admin.localhost` if unset. |

Optional: `SSE_ENABLED`, `LOGIN_PREFILL_*` (dev/QA only).

> **Production:** if `REACT_APP_API_BASE_URL` is missing or `/env` fails, the app **errors** instead of silently using `/fakeApi`.

### How the backend URL is resolved

1. Inject `REACT_APP_API_BASE_URL` into the container environment.
2. Next.js serves it from **`GET /env`** (`src/app/env/route.ts`).
3. The browser loads config via `src/lib/env-service.ts`; RTK Query calls the API (`src/lib/redux/api/api-slice.ts`).

API calls go **from the browser to the backend** (no Next.js API proxy). Use a URL reachable from the **user's machine**.

### Local test (front in Docker, back on the host)

SOGo 6 server on `127.0.0.1:5000`:

```bash
docker run --rm -p 3000:3000 \
  -e REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api/user/v1 \
  -e NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost \
  -e SSE_ENABLED=false \
  sogo-ui
```

Verify:

```bash
curl -s http://localhost:3000/env
curl -s http://127.0.0.1:5000/api/user/v1/system
```

(`jq` is optional for pretty-printing.)

Open [http://localhost:3000](http://localhost:3000) — Network tab should show `127.0.0.1:5000/api/user/v1/...`, not `/fakeApi/...`.

### Production layout (recommended)

```
https://mail.example.com/       → sogo-ui :3000
https://mail.example.com/api/   → SOGo6-server :5000
```

```env
REACT_APP_API_BASE_URL=/api/user/v1
NEXT_PUBLIC_ADMIN_DOMAINS=admin.example.com
SSE_ENABLED=true
```

Reverse proxy (Nginx, Traefik, ingress, etc.) is configured by your platform team. This repo does not ship production compose or Kubernetes manifests.

### Kubernetes / Rancher

- **Container port:** `3000`
- **Health check:** `GET /env` (HTTP 200)
- **Config:** inject environment variables above; no rebuild when the API URL changes
- **Backend:** deploy [SOGo6-server](https://github.com/Alinto/SOGo6-server) separately

## Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Dev server (Turbopack, port 3000) |
| `npm run build` | Production build via Turbopack (`output: 'standalone'`) |
| `npm run build:webpack` | Production build via Webpack (legacy fallback) |
| `npm run start` | Next.js server after build |
| `npm run lint` | ESLint on `src` |
| `npm run type-check` | `tsc` (no emit) |
| `npm test` | Jest suite |
| `npm run test:fast` | Jest, fast path without coverage |
| `npm run test:watch` | Jest watch mode |
| `npm run test:coverage` | Jest with coverage |
| `npm run test:changed` | Tests related to changed files |
| `npm run check:translations` | Translation key checks |

> **Build:** `next.config.mjs` allows production builds to succeed despite TypeScript and ESLint issues (`ignoreBuildErrors` / `ignoreDuringBuilds`). Before a PR, run **`npm run type-check`** and **`npm run lint`** manually.

## Testing

```bash
npm test
npm run test:fast
npm run test -- --watch
```

Covers Redux slices, RTK Query endpoints, components, hooks, and snapshots.

## Contributing

External contributions are **not open** at this time. See **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** and **[`AGENTS.md`](./AGENTS.md)** for context and conventions.

## License

[GPL-3.0 License](./LICENSE)
