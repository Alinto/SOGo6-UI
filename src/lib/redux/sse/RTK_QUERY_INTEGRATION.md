# SSE RTK Query Integration Guide

This document explains how to use the SSE integration with RTK Query for real-time data management.

## Overview

The SSE (Server-Sent Events) integration has been enhanced to work with RTK Query, providing both:

- **Standalone hooks** for direct SSE usage (`useSSE`, `useAutoSSE`, `useSSESubscription`, etc.)
- **RTK Query API** for cache-aware real-time event management

## Store Configuration

The SSE API is automatically integrated into the Redux store:

```typescript
// In /SOGo/src/lib/redux/store.ts
import { sseApi } from './sse/sse-api'

const staticReducers = {
  [apiSlice.reducerPath]: apiSlice.reducer,
  [sseApi.reducerPath]: sseApi.reducer,
}

middleware: (getDefaultMiddleware) =>
  getDefaultMiddleware().concat(apiSlice.middleware).concat(sseApi.middleware)
```

## RTK Query Hooks

### 1. Subscribe to Events

```typescript
import { useSubscribeToEventsQuery } from '@/lib/redux/sse'

function MyComponent() {
  const { data: messages, isLoading } = useSubscribeToEventsQuery({
    eventType: 'calendar:event:created'
  })

  if (isLoading) return <div>Connecting...</div>

  return (
    <div>
      {messages?.map((msg) => (
        <div key={msg.id}>{msg.data}</div>
      ))}
    </div>
  )
}
```

### 2. Get SSE Connection Status

```typescript
import { useGetSSEStatusQuery } from '@/lib/redux/sse'

function StatusComponent() {
  const { data: status } = useGetSSEStatusQuery(undefined, {
    pollingInterval: 5000, // Poll every 5 seconds
  })

  return (
    <div>
      Connection State: {status?.state}
      Message Count: {status?.messageCount}
      Reconnect Attempts: {status?.reconnectAttempts}
    </div>
  )
}
```

### 3. Connect to SSE

```typescript
import { useConnectSSEMutation } from '@/lib/redux/sse'

function ConnectButton() {
  const [connect] = useConnectSSEMutation()

  const handleConnect = async () => {
    try {
      await connect({
        url: 'http://localhost:8000/events',
        reconnectInterval: 5000,
        maxReconnectAttempts: 10,
        heartbeatTimeout: 30000,
      }).unwrap()
      console.log('Connected')
    } catch (error) {
      console.error('Connection failed:', error)
    }
  }

  return <button onClick={handleConnect}>Connect</button>
}
```

### 4. Disconnect from SSE

```typescript
import { useDisconnectSSEMutation } from '@/lib/redux/sse'

function DisconnectButton() {
  const [disconnect] = useDisconnectSSEMutation()

  const handleDisconnect = async () => {
    await disconnect().unwrap()
    console.log('Disconnected')
  }

  return <button onClick={handleDisconnect}>Disconnect</button>
}
```

## RTK Query - The Standard Approach

| Feature                  | RTK Query |
| ------------------------ | --------- |
| Redux Cache Integration  | ✅        |
| Tag-based Invalidation   | ✅        |
| DevTools Support         | ✅        |
| Performance Optimization | ✅        |
| Real-time Updates        | ✅        |
| Polling Support          | ✅        |
| Error Handling           | ✅        |
| Automatic Retry          | ✅        |

## Architecture Notes

### Single Integration Approach

The RTK Query API is the unified approach for all SSE integration:

- All data flows through Redux store
- Cache management handled automatically
- All features have consistent patterns
- DevTools integration for debugging

### Implementation Details

The RTK Query API:

1. Uses `queryFn` for custom EventSource logic
2. Shares the same `SSEService` singleton instance
3. Provides cache invalidation via tags
4. Integrates with Redux DevTools

The service instance:

1. Manages one EventSource connection
2. Handles auto-reconnection with exponential backoff
3. Supports multiple subscribers per event type
4. Provides heartbeat and statistics

## Configuration

Initialize SSE in your app layout:

```typescript
'use client'

import { useEffect } from 'react'
import { useConnectSSEMutation } from '@/lib/redux/sse'
import { useAppDispatch } from '@/lib/redux/hooks'

export default function RootLayout({ children }) {
  const dispatch = useAppDispatch()
  const [connect] = useConnectSSEMutation()

  useEffect(() => {
    connect({
      url: process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000/events',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatTimeout: 30000,
    })
  }, [connect])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

## Error Handling

```typescript
import { useGetSSEStatusQuery } from '@/lib/redux/sse'

function ErrorHandling() {
  const { data: status, error } = useGetSSEStatusQuery()

  if (error) {
    return <div>Connection Error: {error.message}</div>
  }

  if (status?.state === 'error') {
    return <div>SSE Error occurred</div>
  }

  return <div>Connected</div>
}
```

## Migration from WebSocket

If migrating from WebSocket:

1. Replace WebSocket subscriptions with `useSubscribeToEventsQuery` or `useSSESubscription`
2. Use RTK Query hooks for cache consistency
3. Keep standalone hooks for lightweight subscriptions
4. Use same event type format for compatibility

## Performance Tips

1. **Reuse subscriptions**: Don't create multiple subscriptions to the same event type
2. **Unsubscribe when unmounting**: Use cleanup in useEffect
3. **Use RTK Query skip**: Skip queries when not needed
4. **Batch updates**: RTK Query handles batching automatically

## Troubleshooting

### Connection not established

```typescript
const { data: status } = useGetSSEStatusQuery()
console.log('SSE State:', status?.state) // Should be 'connected'
```

### Events not received

1. Check event type matches server subscription
2. Verify URL is correct via `process.env.NEXT_PUBLIC_SSE_URL`
3. Check browser console for network errors
4. Verify heartbeat in stats

### Cache invalidation issues

Use `invalidatesTags` in mutations:

```typescript
const [updateEvent] = useUpdateCalendarEventMutation()
// RTK Query automatically invalidates 'calendar_events' tags
```

## See Also

- [SSE README](./README.md) - Core SSE documentation
- [SSE Setup](./SETUP.md) - Initial setup guide
- [RTK Query Docs](https://redux-toolkit.js.org/rtk-query/overview) - Official RTK Query documentation
