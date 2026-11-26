# ADR — Auth for outbox flush

## Context

Offline outbox flush must authenticate API calls after reconnection. Auth today is stored in `sogo_auth` (localStorage if remember-me, else sessionStorage) via Redux middleware.

## Decision

1. **Do not** store JWT copies inside IndexedDB.
2. Flush reads the token with `readStoredAuth()` / `getAuthToken()` from `sogo_auth`.
3. If token missing or JWT `exp` passed → pause flush, keep outbox items `pending`, show “sign in again” toast.
4. On HTTP 401 during flush → same pause behaviour.
5. Background Sync (Android) wakes clients via `postMessage({ type: 'OUTBOX_FLUSH' })`; the page performs the authenticated fetch (SW does not hold the token).

> **Update:** `readStoredAuth()` (`src/features/offline/auth/get-auth-token.ts`) now prefers the tab's in-memory Redux auth, registered by the `local-storage-sync` middleware via `registerCurrentAuth()`. Once registered, it returns that session (or `null` after logout) even if `sogo_auth` in storage holds another account from another tab; it falls back to `sogo_auth` (localStorage, then sessionStorage) only before the store has registered. Token and uid always come from the same session, so the outbox never flushes one account with another account's token.

## Consequences

- Flush requires a live browser context with readable storage (or cold-start after install with remember-me).
- Session-only auth (`sessionStorage`) may be empty if the PWA process was killed without remember-me — user must re-open and sign in; outbox data remains until wipe/logout.
- iOS has no Background Sync; flush runs on app open / `online` event only.
