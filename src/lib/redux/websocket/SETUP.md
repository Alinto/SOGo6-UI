# WebSocket Integration Setup Guide

This guide walks you through setting up WebSocket integration with RTK Redux in your SOGo6-UI application.

## Installation Steps

### Step 1: Update Redux Store

Open your `src/lib/redux/store.ts` and add the WebSocket reducer:

```typescript
// src/lib/redux/store.ts
import { configureStore, EnhancedStore } from '@reduxjs/toolkit'
import { apiSlice } from './api/api-slice'
import { listenerMiddleware } from './listener-middleware'
import { createReducerManager, ReducerManager } from './reducer-manager'
import webSocketReducer from './websocket'

const staticReducers = {
  [apiSlice.reducerPath]: apiSlice.reducer,
  websocket: webSocketReducer,
}

export const reducerManager = createReducerManager(staticReducers)

export const makeStore = () => {
  const store = configureStore({
    reducer: reducerManager.reduce,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware),
  }) as EnhancedStore & ReducerManager

  store.add = reducerManager.add
  store.remove = reducerManager.remove
  store.getReducerMap = reducerManager.getReducerMap

  return store
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
```

### Step 2: Initialize WebSocket in Root Layout

Create or update your root layout to initialize the WebSocket service:

```typescript
// src/app/layout.tsx
'use client'

import { useEffect } from 'react'
import { initializeWebSocketMiddleware, setStoreInstance } from '@/lib/redux/websocket'
import { useAppStore } from '@/lib/redux/store-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const store = useAppStore()

  useEffect(() => {
    // Set store instance for WebSocket middleware
    if (store) {
      setStoreInstance(store as any)
    }

    // Initialize WebSocket with your server URL
    initializeWebSocketMiddleware({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
      messageTimeout: 5000,
    })
  }, [store])

  return (
    <html>
      <body>
        {/* Your provider structure */}
        {children}
      </body>
    </html>
  )
}
```

### Step 3: Add Environment Variables

Update your `.env.local`:

```bash
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
```

For production:

```bash
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
```

## Basic Usage

### In a Component

```typescript
'use client'

import {
  useAutoConnectWebSocket,
  useWebSocketSubscription,
  useWebSocketMessage,
} from '@/lib/redux/websocket'

export function MyComponent() {
  // Auto connect on mount, disconnect on unmount
  useAutoConnectWebSocket()

  // Subscribe to messages
  useWebSocketSubscription('my-event', (data) => {
    console.log('Received:', data)
  })

  // Send message function
  const sendMessage = useWebSocketMessage()

  const handleClick = () => {
    sendMessage('my-action', { payload: 'data' })
  }

  return <button onClick={handleClick}>Send Message</button>
}
```

## Advanced Setup

### Custom Listener Middleware

If you want to handle WebSocket events with custom Redux middleware:

```typescript
// src/lib/redux/websocket-listeners.ts
import { startAppListening } from './listener-middleware'
import { messageReceived } from './websocket'

export function setupWebSocketListeners() {
  startAppListening({
    actionCreator: messageReceived,
    effect: (action) => {
      const { type, payload } = action.payload

      switch (type) {
        case 'notification':
          // Handle notification
          console.log('Notification received:', payload)
          break

        case 'update':
          // Handle update
          console.log('Update received:', payload)
          break

        default:
          break
      }
    },
  })
}
```

### TypeScript Setup

Define your message types in a separate file:

```typescript
// src/lib/redux/websocket/message-types.ts
export namespace WebSocketMessages {
  export interface Notification {
    id: string
    title: string
    message: string
    type: 'info' | 'warning' | 'error' | 'success'
  }

  export interface ChatMessage {
    id: string
    author: string
    text: string
    timestamp: number
  }

  export interface Presence {
    userId: string
    username: string
    status: 'online' | 'away' | 'offline'
  }
}
```

Then use in components:

```typescript
import { WebSocketMessages } from '@/lib/redux/websocket/message-types'
import { useWebSocketSubscription } from '@/lib/redux/websocket'

export function ChatComponent() {
  useWebSocketSubscription<WebSocketMessages.ChatMessage>(
    'chat:message',
    (message) => {
      console.log(`${message.author}: ${message.text}`)
    }
  )

  return <div>Chat</div>
}
```

## Server-Side Integration

### Express + ws Example

```typescript
// server.ts
import express from 'express'
import { WebSocketServer } from 'ws'
import { createServer } from 'http'

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
  console.log('Client connected')

  ws.on('message', (data) => {
    const message = JSON.parse(data.toString())

    switch (message.type) {
      case 'chat:send':
        // Broadcast to all clients
        wss.clients.forEach((client) => {
          if (client.readyState === ws.OPEN) {
            client.send(
              JSON.stringify({
                type: 'chat:message',
                data: {
                  id: Date.now().toString(),
                  author: 'User',
                  text: message.data.text,
                  timestamp: Date.now(),
                },
              })
            )
          }
        })
        break

      case 'ping':
        ws.send(
          JSON.stringify({
            type: 'pong',
            data: { timestamp: Date.now() },
          })
        )
        break

      default:
        console.log('Unknown message type:', message.type)
    }
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

server.listen(8000, () => {
  console.log('WebSocket server running on ws://localhost:8000')
})
```

### Python + FastAPI Example

```python
# main.py
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
from typing import Set

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")
            msg_data = data.get("data")

            if msg_type == "chat:send":
                await manager.broadcast({
                    "type": "chat:message",
                    "data": {
                        "id": str(id(msg_data)),
                        "author": "User",
                        "text": msg_data["text"],
                        "timestamp": int(time.time() * 1000),
                    }
                })

            elif msg_type == "ping":
                await websocket.send_json({
                    "type": "pong",
                    "data": {"timestamp": int(time.time() * 1000)}
                })

    except Exception as e:
        print(f"Error: {e}")
    finally:
        manager.disconnect(websocket)
```

## Troubleshooting

### Connection Issues

**Problem: WebSocket connects but immediately disconnects**

Solution: Check your server is accepting connections and sending valid responses:

```typescript
// Test connection
import { connectWebSocket } from '@/lib/redux/websocket'

try {
  await connectWebSocket()
  console.log('Connected successfully')
} catch (error) {
  console.error('Connection failed:', error)
}
```

### Message Not Received

**Problem: Subscribed to message but not receiving**

1. Verify message type matches exactly:

```typescript
// Server must send
{ type: 'exact-type', data: {...} }

// Client must subscribe
useWebSocketSubscription('exact-type', callback)
```

2. Check if connected:

```typescript
const isConnected = useWebSocketConnected()
if (!isConnected) {
  // Not connected yet
}
```

### Memory Leaks

**Problem: Multiple subscriptions causing memory leak**

Always unsubscribe in cleanup:

```typescript
useEffect(() => {
  const unsubscribe = wsService?.on('message', handler)
  return () => unsubscribe?.()
}, [])
```

The hooks handle this automatically, so use hooks when possible.

## Performance Optimization

### Debounce High-Frequency Messages

```typescript
import { useMemo, useCallback } from 'react'
import { debounce } from 'lodash'

export function OptimizedComponent() {
  const debouncedHandler = useMemo(
    () => debounce((data) => {
      // Process data
    }, 500),
    []
  )

  useWebSocketSubscription('high-frequency', debouncedHandler)

  return <div>Optimized</div>
}
```

### Memoize Expensive Computations

```typescript
import { useMemo } from 'react'

export function ExpensiveComponent() {
  const [messages, setMessages] = useState([])

  const processedMessages = useMemo(
    () => messages.map(m => expensiveOperation(m)),
    [messages]
  )

  return <div>{processedMessages.length} messages</div>
}
```

## Testing

### Unit Tests

```typescript
import { renderHook, act } from '@testing-library/react'
import { useWebSocket, useWebSocketSubscription } from '@/lib/redux/websocket'

describe('WebSocket Hooks', () => {
  it('should connect and disconnect', async () => {
    const { result } = renderHook(() => useWebSocket())

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.isConnected).toBe(true)

    act(() => {
      result.current.disconnect()
    })

    expect(result.current.isConnected).toBe(false)
  })
})
```

## Next Steps

1. Review the [README.md](./README.md) for detailed API documentation
2. Check [examples.ts](./examples.ts) for code samples
3. Implement your custom message types
4. Set up server-side WebSocket handling
5. Add error handling and logging
6. Test in different network conditions

## Support

For issues or questions:

1. Check the troubleshooting section above
2. Review the examples in `examples.ts`
3. Check browser console for errors
4. Enable debug logging in websocket-service.ts

## File Structure

```
src/lib/redux/websocket/
├── index.ts                    # Main entry point
├── types.ts                    # TypeScript types
├── websocket-service.ts        # Core WebSocket service
├── websocket-slice.ts          # Redux slice & selectors
├── websocket-middleware.ts     # Middleware & listeners
├── websocket-hooks.ts          # React hooks
├── examples.ts                 # Usage examples
├── README.md                   # API documentation
└── SETUP.md                    # This file
```
