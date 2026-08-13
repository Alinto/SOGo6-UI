# PWA spike notes (Epic 0)

## Stack

- **Serwist** via `@serwist/turbopack` (Next 16 + Turbopack)
- SW source: `src/app/sw.ts`
- Route: `src/app/serwist/[path]/route.ts` → `/serwist/sw.js`
- Registration: `SerwistProviderGate` when `NEXT_PUBLIC_PWA_ENABLED=true`

## Pitfalls

- PWA is **off by default**; enable with env flags.
- Dev: confirm SW registration after production-like build if Turbopack quirks appear.
- `output: 'standalone'` remains compatible with Serwist wrapper.
- CKEditor assets use CacheFirst after first online visit.
- Document navigation uses NetworkFirst + `/~offline` fallback.

## Background Sync

- Tag: `outbox-flush`
- Supported: Chrome Android (installed PWA) — best effort
- Not supported: iOS Safari / all iOS browsers (WebKit)

## IndexedDB

- Library: **Dexie**
- DB name: `sogo-offline-{userId}`
- Stores: drafts, outbox, outboxAttachments, cachedFolders, cachedMailHeaders, cachedMailBodies, metaIdentities
- Wipe on logout
