# Multi-Domain Routing

One deployment serves two kinds of hosts:

- **Admin domains**: only the admin panel (`/[locale]/admin_panel/...`) and the login pages are reachable.
- **User domains** (every other host): everything except the admin panel.

The routing is done in the Next.js 16 proxy, `src/proxy.ts` (default export `proxy`). It handles routing only.
Authentication and authorization are still enforced by the pages and by the SOGo API.

## Configuration

```bash
NEXT_PUBLIC_ADMIN_DOMAINS=admin.example.com,manage.example.com
```

- Comma-separated list of hostnames. Do not add a scheme, path or port.
- Matching is **exact** and case-insensitive (`hostnameMatchesAdminDomain`). Entries are trimmed, so a space after a
  comma is fine, and empty entries are ignored. There are no wildcards and no substring matching:
  `admin.example.com` does not match `www.admin.example.com`.
- The port is removed from the `Host` header before the comparison (`normalizeHostname`), so `admin.localhost:3000`
  matches `admin.localhost`.
- The proxy reads the raw `Host` request header. `X-Forwarded-Host` is ignored, so a reverse proxy must forward the
  original `Host` (nginx: `proxy_set_header Host $host;`).

### Unset variable: `/env` and the proxy disagree

- The proxy (`isAdminDomain`) has **no default**. If the variable is unset, no host is an admin domain. Every host is
  then a user domain, and outside development the admin panel cannot be reached at all.
- `GET /env` (`buildEnvRoutePayload` in `src/lib/env-route-payload.ts`) reports `admin.localhost` when the variable is
  unset. That value is informational only: nothing in `src/` uses it for routing. Do not read `/env` to find out
  which domains the proxy treats as admin.
- `.env.example` leaves the variable commented out, and `.env.development` does not set it. To use an admin domain
  locally, set it in `.env.local`.

### Runtime or build time?

`isAdminDomain` reads `process.env.NEXT_PUBLIC_ADMIN_DOMAINS` on each request. However, Next.js replaces every
`NEXT_PUBLIC_*` variable that **exists at build time** with its literal value, in server bundles as well as client
bundles. The proxy is included (`next/dist/build/define-env.js` spreads `getNextPublicEnvironmentVariables()` into
the defines for every compiler).

- **Unset during `npm run build`**: the proxy keeps reading `process.env` at request time. The standalone build then
  contains `process.env.NEXT_PUBLIC_ADMIN_DOMAINS?.split(",")` as is. Setting the variable when the container starts
  (`docker run -e NEXT_PUBLIC_ADMIN_DOMAINS=...`, compose `environment:`) works, and a container restart applies a
  change.
- **Set during the build** (a build `ENV`/`ARG`, or a `.env.production` / `.env` file in the build context): the value
  is frozen into the image, and changing it at runtime has no effect.

The current `Dockerfile` does not set the variable in the `builder` stage. `.dockerignore` excludes `.env` and
`.env.local`, and the repo has no `.env.production`. With the current setup, **the value set at runtime is the one
used.** Keep it that way: never pass this variable as a build argument.

## Decision table

The proxy runs in this order. Paths excluded by `config.matcher` (`/_next`, `/api`, `/env`, `/serwist`, `/~offline`,
the manifest and static files) skip the domain rules entirely. `/fakeApi` is either passed through or returns 404
(`isFakeApiEnabled`: allowed outside production, or when `FAKE_API_ENABLED=true`).

1. A path without a locale prefix is redirected to `/${defaultLocale}` + path (for example `/` -> `/en`).
2. Auth paths (`isAuthPath`: `/[locale]/auth/...`) are allowed on every domain.
3. Domain rules:

| Request                                                                     | Admin domain               | User domain (production) | User domain, `NODE_ENV=development` |
| --------------------------------------------------------------------------- | -------------------------- | ------------------------ | ----------------------------------- |
| `/en/auth/login`, `/en/auth/login/pwd`, `/en/auth/login/sso`                | Allowed                    | Allowed                  | Allowed                             |
| `/en` (locale root)                                                         | Redirect `/en/admin_panel` | Allowed                  | Allowed                             |
| `/en/admin_panel`, `/en/admin_panel/domains`, `.../rules`, `.../sessions`   | Allowed                    | Redirect `/en`           | **Allowed** (dev exception)         |
| `/en/u/...`, `/en/calendars`, `/en/address_books`, `/en/tasks`, `/en/notes` | Redirect `/en/admin_panel` | Allowed                  | Allowed                             |
| `/en/user_settings`, `/en/share/...`                                        | Redirect `/en/admin_panel` | Allowed                  | Allowed                             |

Notes:

- On the admin domain, redirects keep the locale from the request (`/${locale}/admin_panel`). On the user domain, the
  admin-panel redirect always goes to `/${defaultLocale}` (`getDefaultLocale()` in `src/lib/i18n/config.ts`, currently
  `en`, the only locale).
- `isAdminPanelPath` matches `/[locale]/admin_panel` and all of its sub-routes.
- The dev exception only affects the user domain. An admin domain still redirects non-admin routes in development.
  `npm run start` runs with `NODE_ENV=production`, so the exception does not apply there.

## Flow

```
request --> matcher excludes it? --yes--> served without domain rules
              | no
              v
          /fakeApi? --yes--> next() if isFakeApiEnabled(), else 404
              | no
              v
          PWA asset? --yes--> next()
              | no
              v
          has locale prefix? --no--> 302 /en<path>
              | yes
              v
          /[locale]/auth/... ? --yes--> next-intl (allowed)
              | no
              v
          isAdminDomain(Host)?
           |yes                                  |no
           v                                     v
   admin_panel path? --no--> 302         admin_panel path and NODE_ENV != development?
           |yes          /[locale]/admin_panel    |yes --> 302 /en
           v                                     |no
        next-intl                              next-intl
```

## Local testing

1. Add `NEXT_PUBLIC_ADMIN_DOMAINS=admin.localhost` to `.env.local`.
2. `admin.localhost` must resolve to `127.0.0.1`. Chrome, Firefox and recent curl versions resolve any `*.localhost`
   name to the loopback address automatically. For other clients, add `127.0.0.1 admin.localhost` to `/etc/hosts`.
3. `npm run dev`, then:
   - `http://admin.localhost:3000/en` should redirect to `/en/admin_panel`.
   - `http://admin.localhost:3000/en/calendars` should redirect to `/en/admin_panel`.
   - `http://localhost:3000/en/auth/login` should work, and so should the same path on `admin.localhost`.
   - `http://localhost:3000/en/admin_panel` **opens the admin panel**. This is the dev exception, not a bug.
4. To check that the user domain blocks the admin panel, use a production build: `npm run build && npm run start`.
   In that build, `http://localhost:3000/en/admin_panel` should redirect to `/en`. Note that `next build` reads
   `.env.local`, so the value you set there is frozen into this local build (see the section on runtime or build
   time).

The unit tests for these helpers are in `src/__tests__/proxy.test.ts`.

## Troubleshooting

| Symptom                                                    | Likely cause                                                                                                                                                 |
| ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| The admin domain behaves like a user domain                | The variable is unset at runtime (do not rely on `/env`, which shows a default). The entry has a scheme, port or typo. Or the reverse proxy rewrites `Host`. |
| A runtime change of the variable is ignored                | The variable was present when the image was built and its value was inlined. Rebuild without it.                                                             |
| The admin panel opens on `localhost` locally               | Expected under `npm run dev` (dev exception).                                                                                                                |
| `/en/admin_panel` redirects to `/en` in production         | The `Host` is not in the list. Matching is exact: `www.` prefixes and subdomains do not match.                                                               |
| After login on the admin domain, you land on `admin_panel` | Expected: every non-auth, non-admin route is redirected there.                                                                                               |
| `/fakeApi/...` returns 404                                 | Production build without `FAKE_API_ENABLED=true`.                                                                                                            |
