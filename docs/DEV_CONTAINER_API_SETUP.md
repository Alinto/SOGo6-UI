# API Integration with Dev Containers

How the SOGo UI (locally or in its dev container) finds the user API, and how it
falls back to mock data. **The fallback to `/fakeApi` only happens in
development.**

## Quick Start

### 1. Configure the API URL

`.env.development` is tracked in git and already holds the team defaults
(`REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api/user/v1`, `SSE_ENABLED=false`,
login prefill). Don't edit it for personal settings: put overrides in
`.env.local` (git-ignored), using `.env.example` as a reference.

```bash
# .env.local
REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api/user/v1
NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost
```

The value must include the API path (`/api/user/v1`): the health check calls
`${REACT_APP_API_BASE_URL}/system`.

> In the dev container, `REACT_APP_API_BASE_URL` and `SSE_ENABLED` are already
> set as real environment variables by `containerEnv` (see below), and Next.js
> never overrides an existing environment variable with a `.env*` file. To
> change them inside the container, edit `containerEnv` and rebuild, or
> `export`/`unset` them in the shell before `npm run dev`.

### 2. Start

```bash
# VS Code: Ctrl/Cmd + Shift + P → "Dev Containers: Rebuild and Reopen in Container"
npm run dev
```

### 3. Check API status

Open the browser console (F12):

- `✅ API at http://127.0.0.1:5000/api/user/v1 is reachable. Using real API.`
- or `❌ API at ... is not reachable.` followed by `➡️  Switching to /fakeApi (mock data)`

## How It Works

1. The browser fetches `GET /env` (`src/app/env/route.ts`, payload built in
   `src/lib/env-route-payload.ts`).
2. `src/lib/env-service.ts` runs a health check in development:
   `GET ${base}/system` with a **2000 ms timeout** (`HEALTH_CHECK_MS`). It fails
   on a non-2xx status or a JSON `error_code` other than `S000000`.
3. Healthy → real API. Unreachable → `/fakeApi`. If `/env` itself can't be
   fetched, the app also falls back to `/fakeApi` (outside production).
4. `REACT_APP_API_BASE_URL=/fakeApi` skips the health check.

The API calls (health check included) are made **by the browser**, not by the
Next.js server, so the URL must be reachable from the machine running the
browser, and the API must allow CORS from the UI origin. With the default dev
container (`--network=host` and VS Code port forwarding), a host browser reaches
an API published on host port 5000 at `127.0.0.1:5000`.
`host.docker.internal` only helps if the browser itself can resolve that name.

## Environment Variable Priority

Highest first:

1. Real process environment: `containerEnv` in the dev container, or shell
   exports.
2. `.env.development.local`
3. `.env.local` (personal overrides)
4. `.env.development` (tracked team defaults)
5. `.env`
6. Code defaults in `src/lib/env-route-payload.ts`: in development, a missing
   `REACT_APP_API_BASE_URL` becomes `http://127.0.0.1:5000/api/user/v1`;
   `NEXT_PUBLIC_ADMIN_DOMAINS` defaults to `admin.localhost`.

Restart `npm run dev` after changing a `.env*` file.

## Dev Container Settings

`.devcontainer/devcontainer.json`:

- `runArgs`: `--network=host`, `--add-host=host.docker.internal:host-gateway`,
  plus memory/CPU limits.
- `containerEnv` (fixed values, no `${localEnv:...}` interpolation): `TZ`,
  `NODE_ENV=development`, `NEXT_TELEMETRY_DISABLED`, `NODE_OPTIONS`,
  `REACT_APP_API_BASE_URL=http://127.0.0.1:5000/api/user/v1`,
  `SSE_ENABLED=false`.
- Named volumes for `node_modules` and `.next`; `postCreateCommand: npm i`.

## Related Variables

- `SSE_ENABLED`: real-time mail events. In development, on only when
  `SSE_ENABLED=true`; in production, on unless `SSE_ENABLED=false`.
- `FAKE_API_ENABLED`: `/fakeApi` routes are served outside production; in a
  production build they answer 404 unless `FAKE_API_ENABLED=true` or `1`
  (`src/proxy.ts`, demo only).
- `LOGIN_PREFILL_EMAIL` / `LOGIN_PREFILL_PASSWORD`: login form prefill served by
  `/env`. Active outside production; in production only with
  `LOGIN_PREFILL_ENABLED=true` (staging/QA only, `/env` is public).

## Troubleshooting

### Using mock data instead of the real API?

```bash
# Test the health endpoint the UI uses (from the machine running the browser)
curl -fsS http://127.0.0.1:5000/api/user/v1/system || echo "API unreachable"

# What the UI received
curl -fsS http://localhost:3000/env
```

Then refresh the page. Also check the Network tab for CORS errors.

### Environment variables not taken into account?

```bash
echo $REACT_APP_API_BASE_URL     # a value here (e.g. from containerEnv) wins over .env*
curl http://localhost:3000/env   # what Next.js actually serves
```

Restart the dev server; rebuild the container after editing `containerEnv`.

### Common issues

- **Missing API path**: `http://127.0.0.1:5000` → use
  `http://127.0.0.1:5000/api/user/v1`.
- **`.env.local` ignored in the container**: the variable is set by
  `containerEnv` (see priority above).
