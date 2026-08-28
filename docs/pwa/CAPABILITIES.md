# PWA capabilities & limits

## Platforms

| Capability | Android Chrome | iOS Safari |
|---|---|---|
| Install to home screen | Yes (prompt) | Yes (manual Add to Home Screen) |
| Offline shell | Yes | Yes |
| Compose + Outbox | Yes | Yes |
| Auto-send when app open + online | Yes | Yes |
| Auto-send on app reopen | Yes | Yes |
| Background send while app closed | Best effort (one-shot Background Sync) | No |
| Share target / `mailto:` | Chromium | No |
| App badge (unread) | Chromium | Partial |

Periodic Background Sync is **not** implemented: the service worker must not hold a JWT (see [ADR-auth-flush.md](./ADR-auth-flush.md)). Flush still requires an open client (or app reopen).

## Offline reading cache

- Headers: ~75 last messages per folder (Inbox + Sent prefetched at login)
- Bodies: ~100 last opened messages (top 10 Inbox bodies prefetched at login)
- TTL: ~10 days; eviction by mail date (headers) / last access (bodies)
- Persistent storage requested after login (`navigator.storage.persist()`)
- Quota checked before outbox enqueue; usage shown on the cached-mail indicator
- Survives app close; wiped on logout
- Not a full mailbox mirror

## Calendar (opt-in)

- `NEXT_PUBLIC_PWA_CALENDAR_CACHE=true`: read-only events for today through +7 days
- Offline calendar shows a simple agenda list when the week snapshot exists
- Contacts and tasks stay on the honest reconnect overlay

## Feature flags

- `NEXT_PUBLIC_PWA_ENABLED` (master, default off)
- `NEXT_PUBLIC_PWA_OUTBOX` (default true when master on)
- `NEXT_PUBLIC_PWA_MAIL_CACHE` (default true when master on)
- `NEXT_PUBLIC_PWA_BG_SYNC` (default true when master on)
- `NEXT_PUBLIC_PWA_CALENDAR_CACHE` (opt-in, default off even when master on)
