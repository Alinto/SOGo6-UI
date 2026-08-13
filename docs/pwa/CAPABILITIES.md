# PWA capabilities & limits

## Platforms

| Capability | Android Chrome | iOS Safari |
|---|---|---|
| Install to home screen | Yes (prompt) | Yes (manual Add to Home Screen) |
| Offline shell | Yes | Yes |
| Compose + Outbox | Yes | Yes |
| Auto-send when app open + online | Yes | Yes |
| Auto-send on app reopen | Yes | Yes |
| Background send while app closed | Best effort | No |

## Offline reading cache

- Headers: ~75 last messages per folder visited
- Bodies: ~35 last opened messages
- TTL: ~10 days; LRU eviction
- Survives app close; wiped on logout
- Not a full mailbox mirror

## Feature flags

- `NEXT_PUBLIC_PWA_ENABLED` (master, default off)
- `NEXT_PUBLIC_PWA_OUTBOX` (default true when master on)
- `NEXT_PUBLIC_PWA_MAIL_CACHE` (default true when master on)
- `NEXT_PUBLIC_PWA_BG_SYNC` (default true when master on)
