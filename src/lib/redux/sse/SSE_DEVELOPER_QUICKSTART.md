# SSE RTK Query - Developer Quick Start

## Installation & Setup

Already integrated! Just start using it.

## One-Minute Setup

```typescript
// 1. In your root layout (e.g., app/layout.tsx)
'use client'

import { useEffect } from 'react'
import { useConnectSSEMutation } from '@/lib/redux/sse'

export default function RootLayout({ children }) {
  const [connect] = useConnectSSEMutation()

  useEffect(() => {
    connect()
  }, [connect])

  return <html><body>{children}</body></html>
}
```

## Most Common Use Cases

### 1. Subscribe to Real-Time Events

```typescript
import { useSubscribeToEventsQuery } from '@/lib/redux/sse'

function CalendarEvents() {
  const { data: events } = useSubscribeToEventsQuery({
    eventType: 'calendar:event:created'
  })

  return <div>{events?.length || 0} new events</div>
}
```

### 2. Check Connection Status

```typescript
import { useGetSSEStatusQuery } from '@/lib/redux/sse'

function StatusBadge() {
  const { data: status } = useGetSSEStatusQuery()

  return (
    <div className={status?.state === 'connected' ? 'online' : 'offline'}>
      {status?.state}
    </div>
  )
}
```

### 3. Handle Connection Manually

```typescript
import { useConnectSSEMutation, useDisconnectSSEMutation } from '@/lib/redux/sse'

function ConnectionButtons() {
  const [connect] = useConnectSSEMutation()
  const [disconnect] = useDisconnectSSEMutation()

  return (
    <div>
      <button onClick={() => connect()}>Connect</button>
      <button onClick={() => disconnect()}>Disconnect</button>
    </div>
  )
}
```

## RTK Query vs Standalone Hooks

**Use RTK Query for:**

- ✅ Redux cache integration
- ✅ Automatic cache invalidation
- ✅ Redux DevTools support
- ✅ Poll-style status checks
- ✅ Centralized state management

## Common Hooks Reference

| Hook                        | Purpose                   | Example                                                     |
| --------------------------- | ------------------------- | ----------------------------------------------------------- |
| `useSubscribeToEventsQuery` | Subscribe to event stream | `useSubscribeToEventsQuery({ eventType: 'mail:received' })` |
| `useGetSSEStatusQuery`      | Check connection status   | `useGetSSEStatusQuery()`                                    |
| `useConnectSSEMutation`     | Establish connection      | `useConnectSSEMutation()`                                   |
| `useDisconnectSSEMutation`  | Disconnect gracefully     | `useDisconnectSSEMutation()`                                |

## Event Types

Common event types emitted by the server:

```
calendar:event:created
calendar:event:updated
calendar:event:deleted
mail:received
mail:updated
user:preferences:updated
address_book:contact:created
address_book:contact:updated
address_book:contact:deleted
```

## Error Handling

```typescript
function SafeSubscription() {
  const { data, error, isLoading } = useSubscribeToEventsQuery({
    eventType: 'calendar:event:created'
  })

  if (error) {
    return <div className="error">Failed to connect: {error.message}</div>
  }

  if (isLoading) {
    return <div className="loading">Connecting...</div>
  }

  return <div>{data?.length || 0} events</div>
}
```

## Redux DevTools Integration

Open Redux DevTools in your browser:

1. Look for `@@INIT` → `sseApi` actions
2. See all SSE queries and mutations
3. Watch real-time event subscriptions
4. Monitor cache state changes

```javascript
// In Redux DevTools console:
dispatch(
  sseApi.endpoints.subscribeToEvents.initiate({
    eventType: 'calendar:event:created',
  })
)
```

## Configuration

```typescript
// Default configuration (uses env vars)
const [connect] = useConnectSSEMutation()
await connect() // Uses NEXT_PUBLIC_SSE_URL

// Custom configuration
await connect({
  url: 'http://api.example.com/events',
  reconnectInterval: 5000,
  maxReconnectAttempts: 10,
  heartbeatTimeout: 30000,
})
```

## Troubleshooting

| Problem                        | Solution                                         |
| ------------------------------ | ------------------------------------------------ |
| "Connection failed"            | Check `NEXT_PUBLIC_SSE_URL` environment variable |
| No events received             | Verify event type matches server subscription    |
| High memory usage              | Check for memory leaks in subscriptions          |
| Frequent reconnections         | Increase `heartbeatTimeout` or check network     |
| Redux DevTools not showing SSE | Ensure Redux store is properly initialized       |

## Performance Tips

```typescript
// ✅ Good: Reuse subscriptions
const { data: updates } = useSubscribeToEventsQuery({
  eventType: 'calendar:event:updated',
})

// ❌ Avoid: Multiple subscriptions to same type
useSubscribeToEventsQuery({ eventType: 'calendar:event:updated' })
useSubscribeToEventsQuery({ eventType: 'calendar:event:updated' })
useSubscribeToEventsQuery({ eventType: 'calendar:event:updated' })

// ✅ Good: Skip when not needed
useSubscribeToEventsQuery(
  { eventType: 'calendar:event:updated' },
  { skip: !isCalendarOpen }
)
```

## Example: Complete Calendar Integration

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useSubscribeToEventsQuery, useGetSSEStatusQuery } from '@/lib/redux/sse'
import { useGetCalendarEventsQuery } from '@/features/calendars/store/calendars-api'

export default function Calendar() {
  const [calendarId, setCalendarId] = useState('primary')

  // Get initial events from API
  const { data: events } = useGetCalendarEventsQuery(calendarId)

  // Subscribe to real-time updates
  const { data: realTimeUpdates } = useSubscribeToEventsQuery({
    eventType: 'calendar:event:updated'
  })

  // Monitor connection
  const { data: sseStatus } = useGetSSEStatusQuery()

  return (
    <div>
      {/* Status indicator */}
      <div className={`status ${sseStatus?.state}`}>
        {sseStatus?.state === 'connected' ? '🟢' : '🔴'}
        {sseStatus?.state}
      </div>

      {/* Events list */}
      <div className="events">
        <h2>Events ({events?.length || 0})</h2>
        {events?.map(event => (
          <div key={event.id} className="event">
            <h3>{event.summary}</h3>
            <p>{new Date(event.startTime).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Real-time indicator */}
      {realTimeUpdates && realTimeUpdates.length > 0 && (
        <div className="notification">
          {realTimeUpdates.length} updates received!
        </div>
      )}
    </div>
  )
}
```

## Files You Need to Know

- `/SOGo/src/lib/redux/sse/sse-api.ts` - RTK Query API (you don't edit this)
- `/SOGo/src/lib/redux/sse/index.ts` - Hook exports (you import from here)
- `/SOGo/src/lib/redux/store.ts` - Redux configuration (already set up)
- `/SOGo/src/lib/redux/sse/RTK_QUERY_INTEGRATION.md` - Full documentation

## Import Path

```typescript
// Always import from this path:
import {
  useSubscribeToEventsQuery,
  useGetSSEStatusQuery,
  useConnectSSEMutation,
  useDisconnectSSEMutation,
} from '@/lib/redux/sse'
```

## Testing

```typescript
// Mock SSE in tests
jest.mock('@/lib/redux/sse', () => ({
  useSubscribeToEventsQuery: () => ({
    data: [],
    isLoading: false,
  }),
}))

// Or use the real hook with test server
```

## Environment Setup

```bash
# .env.local
NEXT_PUBLIC_SSE_URL=http://localhost:8000/events
```

## Need More Help?

1. **Integration Details**: Read `RTK_QUERY_INTEGRATION.md`
2. **Core SSE Docs**: Read `/SOGo/src/lib/redux/sse/README.md`
3. **Quick Reference**: Read `/SOGo/src/lib/redux/sse/QUICK_REFERENCE.md`
4. **Type Definitions**: Check `/SOGo/src/lib/redux/sse/types.ts`

---

**Status**: ✅ Production Ready  
**Tests**: 1030/1030 passing  
**Last Updated**: Today
