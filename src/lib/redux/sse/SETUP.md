# SSE Setup Guide

Complete step-by-step guide to integrate Server-Sent Events into your SOGo6-UI application.

## Step 1: Add to Redux Store

Update your Redux store configuration:

```typescript
// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import sseReducer from './sse'

export const store = configureStore({
  reducer: {
    // ... existing reducers
    sse: sseReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore EventSource in actions
        ignoredActionPaths: ['payload'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

## Step 2: Initialize in Root Layout

Set up SSE initialization in your root layout:

```typescript
// src/app/layout.tsx or src/app/[locale]/layout.tsx
'use client'

import { useEffect } from 'react'
import { initializeSSEMiddleware } from '@/lib/redux/sse'

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize SSE with your server endpoint
    initializeSSEMiddleware({
      url: process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000/events',
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatTimeout: 30000,
    })
  }, [])

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

Add to your `.env.local`:

```
NEXT_PUBLIC_SSE_URL=http://localhost:8000/events
```

## Step 3: Create SSE Provider (Optional)

For better component organization:

```typescript
// src/providers/sse-provider.tsx
'use client'

import { useEffect } from 'react'
import { initializeSSEMiddleware } from '@/lib/redux/sse'

export function SSEProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeSSEMiddleware({
      url: process.env.NEXT_PUBLIC_SSE_URL || 'http://localhost:8000/events',
    })
  }, [])

  return children
}
```

Then wrap your app:

```typescript
// app/layout.tsx
import { SSEProvider } from '@/providers/sse-provider'

export default function RootLayout() {
  return (
    <html>
      <body>
        <SSEProvider>
          {/* ... */}
        </SSEProvider>
      </body>
    </html>
  )
}
```

## Step 4: Use in Components

Now you can use SSE hooks in any client component:

### Example 1: Connection Status

```typescript
// src/components/sse-status.tsx
'use client'

import { useAutoSSE } from '@/lib/redux/sse'

export function SSEStatus() {
  const { state, error, isConnected } = useAutoSSE()

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span>{state}</span>
      {error && <span className="text-red-600">{error}</span>}
    </div>
  )
}
```

### Example 2: Real-time Notifications

```typescript
// src/components/notifications.tsx
'use client'

import { useSSEData } from '@/lib/redux/sse'

export function Notifications() {
  const { data, loading, error } = useSSEData('notifications')

  if (loading) return <div>Connecting...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {data && (
        <div className="p-4 bg-blue-100 rounded">
          <p>{data.message}</p>
        </div>
      )}
    </div>
  )
}
```

### Example 3: Chat Messages

```typescript
// src/components/chat.tsx
'use client'

import { useSSESubscription, useAutoSSE } from '@/lib/redux/sse'
import { useState } from 'react'

export function Chat() {
  const [messages, setMessages] = useState<any[]>([])
  useAutoSSE()

  useSSESubscription('chat:message', (message) => {
    setMessages((prev) => [...prev, message])
  })

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i} className="p-2 border-b">
          <p className="font-semibold">{msg.user}</p>
          <p>{msg.text}</p>
        </div>
      ))}
    </div>
  )
}
```

## Step 5: Backend Setup Example

### Python (FastAPI)

```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
import asyncio
import json

app = FastAPI()

@app.get("/events")
async def stream_events():
    async def event_generator():
        # Send initial ping
        yield f"event: ping\ndata: {{}}\n\n"

        # Send some data
        while True:
            data = {
                "timestamp": datetime.now().isoformat(),
                "message": "Hello from server"
            }
            yield f"data: {json.dumps(data)}\n\n"
            await asyncio.sleep(5)  # Send every 5 seconds

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )
```

### Node.js (Express)

```javascript
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  // Send ping
  res.write('event: ping\ndata: {}\n\n')

  // Send data every 5 seconds
  const interval = setInterval(() => {
    const data = {
      timestamp: new Date().toISOString(),
      message: 'Hello from server',
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }, 5000)

  req.on('close', () => {
    clearInterval(interval)
    res.end()
  })
})
```

## Step 6: Testing

Create a test component:

```typescript
// src/components/sse-test.tsx
'use client'

import { useSSEStats, useSSEConnected, useSSESubscription } from '@/lib/redux/sse'

export function SSETest() {
  const connected = useSSEConnected()
  const stats = useSSEStats()

  useSSESubscription('test', (data) => {
    console.log('Test message:', data)
  })

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">SSE Status</h3>
      <p>Connected: {connected ? '✓' : '✗'}</p>
      <p>State: {stats.state}</p>
      <p>Messages: {stats.messageCount}</p>
      <p>Reconnects: {stats.reconnectAttempts}</p>
      <p>Last: {stats.lastMessageTime ? new Date(stats.lastMessageTime).toLocaleTimeString() : 'N/A'}</p>
    </div>
  )
}
```

## Troubleshooting

### CORS Issues

Add CORS headers on server:

```python
# FastAPI
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

### Connection keeps failing

1. Check SSE endpoint is accessible
2. Verify headers are correct
3. Look for network errors in browser console
4. Check server logs

### No messages received

1. Check message format is valid JSON
2. Verify correct event type is subscribed to
3. Look at Network tab in DevTools
4. Check `useSSEStats()` for message count

## Next Steps

- Add reconnection notifications
- Implement message history
- Add offline/online detection
- Monitor connection quality
- Add analytics/monitoring
