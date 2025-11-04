# Server-Sent Events (SSE) Integration

Complete Server-Sent Events integration for real-time communication in SOGo6-UI.

## Features

- **EventSource-based communication** - Browser native SSE support
- **Auto-reconnection** - Configurable reconnect with exponential backoff
- **Heartbeat monitoring** - Detects connection loss
- **Type-safe messaging** - TypeScript support for all message types
- **React Hooks** - Easy integration with components
- **Redux integration** - Optional Redux slice for state management
- **Error handling** - Comprehensive error management
- **Statistics tracking** - Message counts, reconnect attempts

## Installation

### 1. Store Configuration

Add SSE reducer to your Redux store:

```typescript
// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import sseReducer from './sse'

export const store = configureStore({
  reducer: {
    sse: sseReducer,
    // ... other reducers
  },
})
```

### 2. Middleware Initialization

Initialize SSE middleware in your app:

```typescript
// src/app/layout.tsx
import { initializeSSEMiddleware } from '@/lib/redux/sse'

export default function RootLayout() {
  useEffect(() => {
    initializeSSEMiddleware({
      url: 'http://localhost:8000/events',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
    })
  }, [])

  return <>{/* ... */}</>
}
```

## Usage Examples

### Basic Connection

```typescript
'use client'

import { useSSE } from '@/lib/redux/sse'

export function EventStatus() {
  const { state, connect, disconnect, isConnected } = useSSE()

  return (
    <div>
      <p>Status: {state}</p>
      <button onClick={connect}>Connect</button>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  )
}
```

### Auto-Connect

```typescript
'use client'

import { useAutoSSE } from '@/lib/redux/sse'

export function RealtimeComponent() {
  const { state, error } = useAutoSSE()

  return (
    <div>
      {error && <p>Error: {error}</p>}
      <p>Connected: {state === 'CONNECTED'}</p>
    </div>
  )
}
```

### Subscribe to Messages

```typescript
'use client'

import { useSSESubscription } from '@/lib/redux/sse'
import { useState } from 'react'

export function MessageListener() {
  const [messages, setMessages] = useState([])

  useSSESubscription('chat:message', (data) => {
    setMessages((prev) => [...prev, data])
  })

  return (
    <ul>
      {messages.map((msg, i) => (
        <li key={i}>{msg.text}</li>
      ))}
    </ul>
  )
}
```

### Get Connection Stats

```typescript
'use client'

import { useSSEStats } from '@/lib/redux/sse'

export function ConnectionStats() {
  const { messageCount, reconnectAttempts, lastMessageTime } = useSSEStats()

  return (
    <div>
      <p>Messages received: {messageCount}</p>
      <p>Reconnect attempts: {reconnectAttempts}</p>
      <p>Last message: {lastMessageTime ? new Date(lastMessageTime).toLocaleString() : 'N/A'}</p>
    </div>
  )
}
```

### Handle Errors

```typescript
'use client'

import { useSSEError } from '@/lib/redux/sse'
import { useEffect, useState } from 'react'

export function ErrorHandler() {
  const [errors, setErrors] = useState<string[]>([])

  useSSEError((error) => {
    setErrors((prev) => [...prev, error.message])
  })

  return (
    <div>
      {errors.map((err, i) => (
        <p key={i} className="text-red-600">{err}</p>
      ))}
    </div>
  )
}
```

### Combined Hook (Most Common)

```typescript
'use client'

import { useSSEData } from '@/lib/redux/sse'

export function RealtimeData() {
  const { data, loading, error } = useSSEData('notifications')

  if (loading) return <div>Connecting...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h2>Notifications</h2>
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  )
}
```

## Configuration

### SSEConfig

```typescript
interface SSEConfig {
  url: string // SSE endpoint URL
  reconnectInterval?: number // Delay between reconnect attempts (ms) - default 5000
  maxReconnectAttempts?: number // Max reconnection attempts - default 10
  heartbeatTimeout?: number // Timeout for heartbeat (ms) - default 30000
  withCredentials?: boolean // Include credentials in requests
  headers?: Record<string, string> // Custom headers
}
```

## Connection States

```typescript
enum SSEConnectionState {
  DISCONNECTED = 'DISCONNECTED'
  CONNECTING = 'CONNECTING'
  CONNECTED = 'CONNECTED'
  RECONNECTING = 'RECONNECTING'
  ERROR = 'ERROR'
  CLOSED = 'CLOSED'
}
```

## Message Format

Messages from the server should be JSON:

```typescript
interface SSEMessage<T> {
  type: string // Message type identifier
  data: T // Actual message data
  timestamp: number // When received (client-side)
}
```

## Server-Side Setup

Your SSE server should send events in this format:

```python
# Python example (FastAPI)
@app.get("/events")
async def stream_events(request: Request):
    async def event_generator():
        # Send heartbeat
        yield "event: ping\n"
        yield "data: {}\n\n"

        # Send data
        yield "data: {\"message\": \"Hello\"}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
```

## Architecture

```
┌─────────────────────────────────┐
│        React Component           │
├─────────────────────────────────┤
│ useSubscribeToEventsQuery       │
│ useGetSSEStatusQuery            │
│ useConnectSSEMutation           │
│ useDisconnectSSEMutation        │
├─────────────────────────────────┤
│  RTK Query API (sse-api.ts)     │
│  - Endpoints & hooks            │
│  - Cache management             │
│  - Tag-based invalidation       │
├─────────────────────────────────┤
│     SSE Service (sse-service.ts)|
│  - Connection management        │
│  - Message subscriptions        │
│  - Error handling               │
│  - Reconnection logic           │
├─────────────────────────────────┤
│       Browser EventSource       │
└─────────────────────────────────┘
```

## Best Practices

1. **Initialize in layout** - Use `useConnectSSEMutation()` in root layout
2. **Subscribe to events** - Use `useSubscribeToEventsQuery()` in components
3. **Handle errors** - Always check `error` in hook results
4. **Monitor status** - Use `useGetSSEStatusQuery()` for connection health
5. **Skip when not needed** - Use `skip` option to avoid unnecessary subscriptions
6. **Batch subscriptions** - Reuse same event type across components

## Troubleshooting

### Connection fails

- Check CORS headers on server
- Verify SSE endpoint is accessible
- Check `NEXT_PUBLIC_SSE_URL` environment variable
- Review browser console for network errors

### Missing events

- Verify event type matches server subscription
- Check connection status with `useGetSSEStatusQuery()`
- Review Redux DevTools for cache state
- Monitor network tab for SSE stream

### High memory usage

- Check for duplicate subscriptions to same event type
- Ensure components unmount and unsubscribe properly
- Monitor Redux DevTools for growing cache
- Use `skip` option for conditional subscriptions

## Files

- `types.ts` - TypeScript interfaces and types
- `sse-service.ts` - Core SSE service with connection management
- `sse-api.ts` - RTK Query API and endpoints
- `index.ts` - Main exports

## License

Same as SOGo6-UI
