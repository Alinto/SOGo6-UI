# ADR — Auth for outbox flush

## Context

Offline outbox flush must authenticate API calls after reconnection. Auth today is stored in `sogo_auth` (localStorage if remember-me, else sessionStorage) via Redux middleware.

## Decision

1. **Do not** store JWT copies inside IndexedDB.
2. Flush reads the token with `readStoredAuth()` / `getAuthToken()` from `sogo_auth`.
3. If token missing or JWT `exp` passed → pause flush, keep outbox items `pending`, show “sign in again” toast.
4. On HTTP 401 during flush → same pause behaviour.
5. Background Sync (Android) wakes clients via `postMessage({ type: 'OUTBOX_FLUSH' })`; the page performs the authenticated fetch (SW does not hold the token).

## Consequences

- Flush requires a live browser context with readable storage (or cold-start after install with remember-me).
- Session-only auth (`sessionStorage`) may be empty if the PWA process was killed without remember-me — user must re-open and sign in; outbox data remains until wipe/logout.
- iOS has no Background Sync; flush runs on app open / `online` event only.
