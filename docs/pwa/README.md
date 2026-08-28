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

Recommended production combo: master + outbox + mail cache + bg sync `true`. Leave `NEXT_PUBLIC_PWA_BG_SYNC=false` on iOS-only deployments. Leave calendar cache off until Playwright offline is green.

## Playwright

```bash
npx playwright install chromium
npm run test:e2e:pwa
```

Starts a dedicated Next dev server on port 3100 with PWA flags and `/fakeApi`.

## Docs

- [ADR-auth-flush.md](./ADR-auth-flush.md)
- [SPIKE-notes.md](./SPIKE-notes.md)
- [CAPABILITIES.md](./CAPABILITIES.md)
- [QA-CHECKLIST.md](./QA-CHECKLIST.md)
- [AO-ANNEX.md](./AO-ANNEX.md)
