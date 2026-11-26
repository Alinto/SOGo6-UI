# PWA spike notes (Epic 0)

> **Historical working notes** from the Epic 0 spike, kept for context. They are **not normative** and may lag the code. For current behaviour and limits, see [CAPABILITIES.md](./CAPABILITIES.md).

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
- Document navigation uses NetworkOnly (documents are never runtime-cached); offline, it falls back to the precached login / `/{locale}/~offline` / `/~offline` pages (`fallbacks` in `src/app/sw.ts`).

## Background Sync

- Tag: `outbox-flush`
- Supported: Chrome Android (installed PWA) — best effort
- Not supported: iOS Safari / all iOS browsers (WebKit)

## IndexedDB

- Library: **Dexie**
- DB name: `sogo-offline-{userId}`
- Stores: drafts, outbox, outboxAttachments, cachedFolders, cachedMailHeaders, cachedMailBodies, metaIdentities, kv, cachedCalendarEvents
- Wipe on logout
