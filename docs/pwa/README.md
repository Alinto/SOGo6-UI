# PWA rollout notes

## Enable

```bash
NEXT_PUBLIC_PWA_ENABLED=true
NEXT_PUBLIC_PWA_OUTBOX=true
NEXT_PUBLIC_PWA_MAIL_CACHE=true
NEXT_PUBLIC_PWA_BG_SYNC=true
# Opt-in calendar J/J+7 read-only cache (off by default)
# NEXT_PUBLIC_PWA_CALENDAR_CACHE=true
```

Master flag defaults to **off**. Enable on staging first, then production.

### Build-time flags (Docker)

The `NEXT_PUBLIC_PWA_*` flags are read in `src/features/offline/flags.ts` with static `process.env.NEXT_PUBLIC_…` access, so Next.js **inlines them into the client bundle at build time** (`npm run build`). Setting them on a running container has no effect; unlike `/env` values, they are not runtime config.

The `Dockerfile` declares no `ARG`/`ENV` for them (its only build arg is `SOURCE_VERSION`), and `.dockerignore` excludes `.env` and `.env*.local` files from the build context. **As things stand, the Docker image is always built with PWA off.** Enabling it there requires adding build args, e.g. `ARG NEXT_PUBLIC_PWA_ENABLED` + `ENV NEXT_PUBLIC_PWA_ENABLED=${NEXT_PUBLIC_PWA_ENABLED}` (same for the other flags) in the builder stage before `RUN npm run build`, then `docker build --build-arg NEXT_PUBLIC_PWA_ENABLED=true …`.

Recommended production combo: master + outbox + mail cache + bg sync `true`. Leave `NEXT_PUBLIC_PWA_BG_SYNC=false` on iOS-only deployments. Leave calendar cache off until Playwright offline is green.

## Playwright

```bash
npx playwright install chromium
npm run test:e2e:pwa
```

Starts a dedicated Next dev server on port 3100 with PWA flags and `/fakeApi`.

## Docs

- [CAPABILITIES.md](./CAPABILITIES.md): current capabilities, limits and flags (reference)
- [ADR-auth-flush.md](./ADR-auth-flush.md): auth decision for outbox flush
- [QA-CHECKLIST.md](./QA-CHECKLIST.md): manual + Playwright QA checklist
- [SPIKE-notes.md](./SPIKE-notes.md): historical Epic 0 working notes (not normative)
- [AO-ANNEX.md](./AO-ANNEX.md): tender-response copy, kept for reference (not technical documentation)
