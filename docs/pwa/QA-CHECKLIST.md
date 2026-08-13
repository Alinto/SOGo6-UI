# PWA QA checklist (AO + regression)

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
