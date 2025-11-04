# Mail Received SSE Integration

## Overview

This feature provides real-time synchronization of incoming mails with the Redux cache using Server-Sent Events (SSE). When a `mail:received` event is received via SSE, the mail is automatically prepended to the top of the cached messages list for the specified folder.

## Architecture

### Components

1. **SSE API (`/SOGo/src/lib/redux/sse/sse-api.ts`)**
   - RTK Query integration for SSE subscriptions
   - Provides `useSubscribeToEventsQuery` hook for subscribing to event types
   - Manages connection state and event streaming

2. **Mail Received Listener Hook (`/SOGo/src/lib/redux/hooks/use-mail-received-listener.ts`)**
   - Custom React hook that listens for `mail:received` events
   - Transforms SSE event data to `ImapMessagesList` format
   - Updates RTK Query cache using `apiSlice.util.updateQueryData`

3. **Mail API (`/SOGo/src/features/mails/store/mails-api.ts`)**
   - RTK Query endpoints: `getFolderMessages`
   - Provides cache tags: `{ type: 'folder/messages', folder }`
   - Handles mail folder and message queries

4. **Fake SSE Endpoint (`/SOGo/src/app/fakeApi/sse/route.ts`)**
   - Mock SSE endpoint for development
   - Sends `mail:received` events every 5 seconds
   - Event structure: `{ id, from, subject, preview, receivedAt, unread }`

## Usage

### Basic Usage

In any client component where you're displaying mails:

```tsx
'use client'

import { useGetFolderMessagesQuery } from '@/features/mails/store/mails-api'
import { useMailReceivedListener } from '@/lib/redux/hooks/use-mail-received-listener'

export function MailList({ folder = 'INBOX' }) {
  // Enable real-time mail updates
  useMailReceivedListener(folder)

  // Fetch folder messages
  const { data: messagesData, isLoading } = useGetFolderMessagesQuery({
    folder,
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {messagesData?.messages.map((mail) => (
        <MailItem key={mail.id} mail={mail} />
      ))}
    </div>
  )
}

function MailItem({ mail }) {
  return (
    <div className="mail-item">
      <h3>{mail.subject}</h3>
      <p>
        {mail.from.name} &lt;{mail.from.email}&gt;
      </p>
      <p>{mail.snippet}</p>
    </div>
  )
}
```

### How It Works

1. **Hook Initialization**

   ```tsx
   useMailReceivedListener('INBOX')
   ```

   - Subscribes to `mail:received` SSE events

2. **Event Reception**
   - SSE endpoint sends event every 5 seconds (in development)
   - Event structure:
     ```json
     {
       "type": "mail:received",
       "data": {
         "id": "mail-123",
         "from": { "name": "John", "email": "john@example.com" },
         "subject": "New Email",
         "preview": "Email preview...",
         "receivedAt": "2024-01-01T12:00:00Z",
         "unread": true
       }
     }
     ```

3. **Cache Update**
   - Hook receives the latest SSE message
   - Transforms SSE data to `ImapMessagesList` format:
     ```typescript
     {
       id: string
       subject: string
       from: { name: string, email: string }
       to: { name: string, email: string }[]
       date: string
       seen: boolean
       flagged: boolean
       hasAttachment: boolean
       snippet: string
     }
     ```
   - Uses RTK Query's `updateQueryData` to prepend mail to the cache
   - Updates total mail count

4. **UI Update**
   - Redux cache is updated immediately
   - Component re-renders with new mail at the top of the list

## Data Flow

```
SSE Endpoint
    ↓
useSubscribeToEventsQuery
    ↓
useMailReceivedListener (useEffect)
    ↓
Transform SSE data → ImapMessagesList
    ↓
dispatch(apiSlice.util.updateQueryData())
    ↓
Update getFolderMessages cache
    ↓
Prepend mail to messages array
    ↓
Component re-renders with new mail
```

## Development

### Testing the Feature

1. **Start the development server**

   ```bash
   npm run dev
   ```

2. **Open a mail folder page**
   - Navigate to any mail folder (e.g., INBOX)
   - Open the Network tab in DevTools

3. **Observe SSE events**
   - You should see SSE stream from `/fakeApi/sse`
   - New mails will appear every 5 seconds at the top of the list

### Using Real SSE Endpoint

For production, replace the fake endpoint with a real one:

1. Update the SSE configuration in your environment variables
2. Ensure your backend sends events in the format:
   ```json
   {
     "type": "mail:received",
     "data": {
       /* mail object */
     }
   }
   ```

## Event Data Transformation

The hook transforms SSE event data to mail list format:

| SSE Field    | ImapMessagesList Field | Default                          |
| ------------ | ---------------------- | -------------------------------- |
| `id`         | `id`                   | `mail-${Date.now()}`             |
| `subject`    | `subject`              | `'New Message'`                  |
| `from`       | `from`                 | `{ name: 'Unknown', email: '' }` |
| N/A          | `to`                   | `[]`                             |
| `receivedAt` | `date`                 | `new Date().toISOString()`       |
| N/A          | `seen`                 | `false`                          |
| N/A          | `flagged`              | `false`                          |
| N/A          | `hasAttachment`        | `false`                          |
| `preview`    | `snippet`              | `''`                             |

## Cache Management

The feature uses RTK Query's automatic cache management:

- **Cache Key**: `{ type: 'folder/messages', folder }`
- **Operation**: Prepend new mail to messages array
- **Total Count**: Incremented by 1

## Performance Considerations

1. **No duplicate events**: Hook processes only the latest SSE message per render
2. **Efficient updates**: Uses RTK Query's `updateQueryData` for direct cache mutations
3. **Memory usage**: Cache maintains a configurable `keepUnusedDataFor` (default 3600s)
4. **Event frequency**: Fake endpoint sends events every 5 seconds (adjust as needed)

## Error Handling

The hook includes defensive checks:

- Validates SSE message has `type === 'mail:received'`
- Checks for valid `data` field
- Uses fallback values for missing fields
- Safe array operations with `Array.isArray()` checks

## Related Files

- Mail Types: `/SOGo/src/features/mails/mails-types.ts`
- Mail API: `/SOGo/src/features/mails/store/mails-api.ts`
- SSE API: `/SOGo/src/lib/redux/sse/sse-api.ts`
- Fake SSE: `/SOGo/src/app/fakeApi/sse/route.ts`
- Hook: `/SOGo/src/lib/redux/hooks/use-mail-received-listener.ts`
