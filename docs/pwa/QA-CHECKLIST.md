# PWA QA checklist (AO + regression)

## Playwright (Chromium)

Run `npm run test:e2e:pwa` (dev server on :3100, fakeApi, PWA flags on).

- [ ] Login page + DevTools offline → offline banner
- [ ] Seeded session, go offline, Calendar → in-app overlay (not a blank page)
- [ ] `?compose=1` shortcut strips the param and opens compose
- [ ] Logout while offline → URL is `/{locale}/auth/login`

## Android Chrome

- [ ] Install PWA from Chrome
- [ ] Open offline after one online visit → shell visible
- [ ] Offline banner appears / disappears
- [ ] Compose offline → message in Outbox
- [ ] Edit / delete Outbox item
- [ ] Attach file offline within limits
- [ ] Reconnect with app open → auto send
- [ ] Kill app, reconnect, reopen → flush pending
- [ ] Background sync best-effort (optional observation)
- [ ] Logout wipes IndexedDB (no cross-account leak)

## Desktop Chrome / Edge

- [ ] Installable
- [ ] Offline shell
- [ ] Outbox flush on online

## iOS Safari

- [ ] Add to Home Screen
- [ ] Compose + Outbox offline
- [ ] Flush on reopen (no background sync expected)

## Online regression

- [ ] Normal send still works
- [ ] Server draft autosave still works
- [ ] SSE reconnects after offline→online
- [ ] Attachments online unchanged
