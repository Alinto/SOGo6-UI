# Mail SSE Integration - Quick Start Guide

## 1️⃣ Import the Hook

```tsx
import { useMailReceivedListener } from '@/lib/redux/hooks/use-mail-received-listener'
```

## 2️⃣ Add to Your Component

```tsx
'use client'

import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useMailReceivedListener } from '@/lib/redux/hooks/use-mail-received-listener'

export function MyMailComponent() {
  // Just add this one line!
  useMailReceivedListener('INBOX')

  // Rest of your component...
  const { data } = useGetFolderMessagesQuery({ folder: 'INBOX' })

  return (
    // Your UI here
  )
}
```

## ✨ That's It!

New mails will now appear at the top of your list automatically when received via SSE.

---

## What Happens Behind the Scenes

```
1. Hook subscribes to mail:received SSE events
   ↓
2. SSE event arrives with new mail data
   ↓
3. Hook transforms data to mail format
   ↓
4. Redux cache is updated (mail prepended to list)
   ↓
5. Component re-renders with new mail at top
```

---

## Usage Examples

### Single Folder

```tsx
function InboxPage() {
  useMailReceivedListener('INBOX')
  // ...
}
```

### Multiple Folders

```tsx
function MailApp() {
  useMailReceivedListener('INBOX')
  useMailReceivedListener('Sent')
  useMailReceivedListener('Drafts')
  // ...
}
```

### With Loading State

```tsx
function MailList({ folder }) {
  useMailReceivedListener(folder)
  const { data, isLoading, isFetching } = useGetFolderMessagesQuery({ folder })

  return (
    <div>
      {isFetching && <p>Syncing...</p>}
      {/* mail list */}
    </div>
  )
}
```

---

## Parameters

```typescript
useMailReceivedListener(folder?: string)
```

| Parameter | Type   | Default   | Description                            |
| --------- | ------ | --------- | -------------------------------------- |
| `folder`  | string | `'INBOX'` | Folder to update when new mail arrives |

---

## Default Behavior

- ✅ Subscribes to `mail:received` SSE events
- ✅ Prepends new mail to the top of the list
- ✅ Marks mail as unread (`seen: false`)
- ✅ Sets received date to current time or SSE `receivedAt`
- ✅ Updates total mail count

---

## What New Mails Look Like

```typescript
{
  id: "mail-123",
  subject: "New Message",
  from: { name: "John Doe", email: "john@example.com" },
  to: [],
  date: "2024-01-01T12:00:00.000Z",
  seen: false,
  flagged: false,
  hasAttachment: false,
  snippet: "Email preview text..."
}
```

---

## Testing in Development

1. Open mail folder
2. New mail will appear every 5 seconds
3. Open DevTools → Network tab
4. Filter by `/fakeApi/sse`
5. Watch for continuous SSE stream

---

## No Additional Configuration Needed ✓

- ✅ Redux setup - already done
- ✅ RTK Query setup - already done
- ✅ SSE endpoint - mocked for development
- ✅ Mail types - already defined

Just import and use! 🚀

---

## Troubleshooting

| Issue                  | Solution                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| Mails not updating     | Make sure `useMailReceivedListener()` is in a `'use client'` component |
| Wrong folder updating  | Check folder name matches your folder parameter                        |
| Component re-rendering | This is normal! SSE events trigger updates every 5s in dev             |

---

## Need More Details?

See full documentation:

- **Architecture**: `/SOGo/docs/SSE_MAIL_INTEGRATION.md`
- **Examples**: `/SOGo/docs/MAIL_SSE_EXAMPLE.tsx`
- **Implementation**: `/SOGo/docs/MAIL_SSE_IMPLEMENTATION.md`

---

## Next Steps

1. ✅ Add the hook to your mail component
2. ✅ Test with fake SSE endpoint in development
3. ✅ Configure real SSE endpoint for production
4. ✅ Monitor performance with Redux DevTools

Enjoy real-time mails! 📧
