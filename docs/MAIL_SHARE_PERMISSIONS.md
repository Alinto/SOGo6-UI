# Mail folder sharing — permission mapping

Reference for how the folder-sharing UI's simplified permissions relate to
the advanced (IMAP-equivalent) permissions, and how each advanced permission
maps to its underlying IMAP ACL right (RFC 4314).

Source of truth: `SIMPLIFIED_PERMISSIONS` / `ADVANCED_PERMISSIONS` in
[`src/features/mails/utils/permission-mapping.ts`](../src/features/mails/utils/permission-mapping.ts).
Labels below are the English ones from `src/messages/en/mails/commons.json`
(French: `src/messages/fr/mails/commons.json`).

## Simplified permissions ↔ linked advanced rights

| Simplified permission (key) | Linked advanced rights (IMAP code) |
|---|---|
| Read (`read`) | View folder (l), Read mail (r) |
| Modify mail (`modify`) | Mark as read/unread (s), Modify mail flags (w) |
| Delete mail (`delete`) | Erase mail (t), Expunge folder (e) |
| Move mail (`move`) | Insert, copy and move mail (i) |
| Administer folder rights (`administerRights`) | Administer folder ACL (a) |
| Administer subfolders (`administerSubfolders`) | Create subfolders (k), Remove folder (x) |

A simplified permission is shown as checked only when all of its linked
rights are on. `read`, `modify`, `delete` and `move` form a chain
(`SIMPLIFIED_CHAIN`): checking one also checks every earlier one.
`administerRights` and `administerSubfolders` are independent toggles.
Independently of the view, turning on `s`, `w`, `t` or `e` forces `l` and `r`
on (`enforceHierarchy`).

`administerSubfolders` grants `k` and `x` because, combined with `read`, it
covers creating, deleting and renaming subfolders (an IMAP RENAME needs `x`
on the old name and `k` on the new parent).

⚠️ Only one advanced right has no simplified equivalent and is available
only in the advanced view: **Post mail (p)**.

## Advanced permissions ↔ IMAP right

| Advanced permission (label) | Field | IMAP code |
|---|---|---|
| View folder | `userCanViewFolder` | l |
| Read mail | `userCanReadMails` | r |
| Mark as read/unread | `userCanMarkMailsRead` | s |
| Modify mail flags | `userCanWriteMails` | w |
| Insert, copy and move mail | `userCanInsertMails` | i |
| Post mail | `userCanPostMails` | p |
| Create subfolders | `userCanCreateSubfolders` | k |
| Remove folder | `userCanRemoveFolder` | x |
| Erase mail | `userCanEraseMails` | t |
| Expunge folder | `userCanExpungeFolder` | e |
| Administer folder ACL | `userIsAdministrator` | a |
