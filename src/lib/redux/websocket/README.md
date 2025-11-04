# WebSocket Integration with RTK Redux

Complete WebSocket integration with Redux Toolkit, including automatic reconnection, heartbeat, and type-safe messaging.

## Features

- ✅ **Automatic Reconnection** - Configurable exponential backoff
- ✅ **Heartbeat** - Keep connection alive
- ✅ **Type-Safe Messaging** - Full TypeScript support
- ✅ **Redux Integration** - Seamless state management
- ✅ **React Hooks** - Easy integration in components
- ✅ **Message Queuing** - Handle messages when disconnected
- ✅ **Event System** - Subscribe to specific message types
- ✅ **Connection State** - Track connection status

## Quick Start

### 1. Setup the Redux Store

Add the WebSocket reducer to your Redux store:

```typescript
// src/lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import webSocketReducer from '@/lib/redux/websocket'
import { listenerMiddleware } from '@/lib/redux/listener-middleware'

export const makeStore = () => {
  const store = configureStore({
    reducer: {
      // ... other reducers
      websocket: webSocketReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(listenerMiddleware.middleware),
  })

  return store
}
```

### 2. Initialize WebSocket Middleware

Initialize the WebSocket service in your app root:

```typescript
// src/app/layout.tsx or your entry point
'use client'

import { useEffect } from 'react'
import { initializeWebSocketMiddleware, useAutoConnectWebSocket } from '@/lib/redux/websocket'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize WebSocket once
    initializeWebSocketMiddleware({
      url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      maxReconnectDelay: 30000,
      heartbeatInterval: 30000,
    })
  }, [])

  return (
    <html>
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
```

## Usage

### In Components

#### Basic Connection

```typescript
import { useWebSocket, useWebSocketSubscription } from '@/lib/redux/websocket'

export function ChatComponent() {
  const { connect, disconnect, isConnected } = useWebSocket()

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
}
```

#### Auto Connect/Disconnect

```typescript
import { useAutoConnectWebSocket } from '@/lib/redux/websocket'

export function MyComponent() {
  const { isConnected } = useAutoConnectWebSocket({
    autoConnect: true,
    autoDisconnect: true,
  })

  return <div>Connected: {isConnected}</div>
}
```

#### Subscribe to Messages

```typescript
import { useWebSocketSubscription, useWebSocketMessage } from '@/lib/redux/websocket'

interface Notification {
  id: string
  title: string
  message: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const sendMessage = useWebSocketMessage()

  // Subscribe to notifications
  useWebSocketSubscription<Notification>('notification', (notification) => {
    setNotifications((prev) => [...prev, notification])
  })

  // Send a message
  const handleSendMessage = () => {
    sendMessage('chat:message', {
      text: 'Hello World',
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      <button onClick={handleSendMessage}>Send</button>
      {notifications.map((n) => (
        <div key={n.id}>{n.message}</div>
      ))}
    </div>
  )
}
```

#### Get Reactive Data

```typescript
import { useWebSocketData } from '@/lib/redux/websocket'

interface UserStatus {
  userId: string
  status: 'online' | 'offline'
}

export function UserStatus() {
  const userStatus = useWebSocketData<UserStatus>('user:status')

  return <div>Status: {userStatus?.status}</div>
}
```

#### Track Connection State

```typescript
import {
  useWebSocketConnected,
  useWebSocketError,
  useWebSocketReconnectAttempts,
} from '@/lib/redux/websocket'

export function ConnectionStatus() {
  const isConnected = useWebSocketConnected()
  const error = useWebSocketError()
  const attempts = useWebSocketReconnectAttempts()

  return (
    <div>
      <p>Connected: {isConnected ? '✓' : '✗'}</p>
      {error && <p>Error: {error}</p>}
      <p>Reconnect attempts: {attempts}</p>
    </div>
  )
}
```

### Advanced Usage

#### Custom Message Handler

```typescript
import {
  subscribeToWebSocketMessage,
  sendWebSocketMessage,
} from '@/lib/redux/websocket'

// Subscribe to a message type
const unsubscribe = subscribeToWebSocketMessage<{ count: number }>(
  'counter:update',
  (data) => {
    console.log('Counter updated:', data.count)
  }
)

// Send a message
sendWebSocketMessage('counter:increment', { by: 1 })

// Unsubscribe
unsubscribe()
```

#### Connection State Changes

```typescript
import { useWebSocketConnectionState } from '@/lib/redux/websocket'

export function MyComponent() {
  useWebSocketConnectionState((state) => {
    console.log('Connection state changed to:', state)
  })

  return <div>Listening to connection state</div>
}
```

#### Listen to Redux State

```typescript
import {
  selectWebSocketStatus,
  selectIsWebSocketConnected,
  selectWebSocketError,
} from '@/lib/redux/websocket'
import { useSelector } from 'react-redux'

export function MyComponent() {
  const status = useSelector(selectWebSocketStatus)
  const isConnected = useSelector(selectIsWebSocketConnected)
  const error = useSelector(selectWebSocketError)

  return (
    <div>
      <p>Status: {status}</p>
      <p>Connected: {isConnected}</p>
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

## API Reference

### Initialization

```typescript
initializeWebSocketMiddleware(config: WebSocketConfig): void
```

Initializes the WebSocket service with configuration.

**Config Options:**

- `url` (string): WebSocket server URL
- `reconnectAttempts` (number, default: 5): Max reconnection attempts
- `reconnectDelay` (number, default: 3000ms): Initial reconnect delay
- `maxReconnectDelay` (number, default: 30000ms): Max reconnect delay
- `heartbeatInterval` (number, default: 30000ms): Heartbeat interval
- `messageTimeout` (number, default: 5000ms): Message timeout

### Hooks

#### `useWebSocket()`

Returns connection control functions.

```typescript
const { connect, disconnect, isConnected, isConnecting, isLoading } =
  useWebSocket()
```

#### `useAutoConnectWebSocket(options?)`

Automatically connects on mount and disconnects on unmount.

```typescript
const { isConnected } = useAutoConnectWebSocket({
  autoConnect: true,
  autoDisconnect: true,
})
```

#### `useWebSocketSubscription(type, callback)`

Subscribe to messages of a specific type.

```typescript
useWebSocketSubscription<T>('message-type', (data, message) => {
  // Handle message
})
```

#### `useWebSocketMessage()`

Send WebSocket messages.

```typescript
const sendMessage = useWebSocketMessage()
sendMessage('message-type', data)
```

#### `useWebSocketData(messageType, initialData?)`

Get reactive data from WebSocket messages.

```typescript
const data = useWebSocketData<T>('message-type', initialValue)
```

#### `useWebSocketConnectionState(callback)`

Listen to connection state changes.

```typescript
useWebSocketConnectionState((state) => {
  console.log('State:', state)
})
```

### Status Hooks

```typescript
useWebSocketStatus() // Get current connection status
useWebSocketConnected() // Check if connected
useWebSocketConnecting() // Check if connecting
useWebSocketError() // Get error message
useWebSocketLastMessageReceived() // Get last message timestamp
useWebSocketReconnectAttempts() // Get reconnect attempts count
```

### Functions

```typescript
connectWebSocket(): Promise<void>
disconnectWebSocket(): void
sendWebSocketMessage<T>(type: string, data: T): void
subscribeToWebSocketMessage<T>(type: string, callback): () => void
subscribeToWebSocketConnectionState(callback): () => void
getWebSocketServiceInstance(): WebSocketService | null
```

## Message Format

All WebSocket messages follow this format:

```typescript
interface WebSocketMessage<T = unknown> {
  type: string // Message type
  data: T // Message payload
  timestamp?: number // Timestamp
  id?: string // Unique message ID
}
```

**Example:**

```typescript
{
  type: 'notification',
  data: { title: 'Hello', message: 'World' },
  timestamp: 1699999999000,
  id: '1699999999000-0.123456'
}
```

## Connection State

```typescript
enum WebSocketConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}
```

## Error Handling

```typescript
try {
  await connectWebSocket()
} catch (error) {
  console.error('Failed to connect:', error)
}

// Or use the error selector
const error = useWebSocketError()
if (error) {
  console.error('WebSocket error:', error)
}
```

## Examples

### Chat Application

```typescript
import { useWebSocketSubscription, useWebSocketMessage } from '@/lib/redux/websocket'

interface Message {
  id: string
  author: string
  text: string
  timestamp: number
}

export function ChatApp() {
  const [messages, setMessages] = useState<Message[]>([])
  const sendMessage = useWebSocketMessage()

  // Subscribe to incoming messages
  useWebSocketSubscription<Message>('chat:message', (message) => {
    setMessages((prev) => [...prev, message])
  })

  const handleSendMessage = (text: string) => {
    sendMessage('chat:send', {
      text,
      timestamp: Date.now(),
    })
  }

  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          <strong>{m.author}</strong>: {m.text}
        </div>
      ))}
      <input
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSendMessage(e.currentTarget.value)
            e.currentTarget.value = ''
          }
        }}
        placeholder="Type a message..."
      />
    </div>
  )
}
```

### Real-time Notifications

```typescript
import {
  useAutoConnectWebSocket,
  useWebSocketData,
} from '@/lib/redux/websocket'

interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  message: string
}

export function NotificationCenter() {
  useAutoConnectWebSocket()
  const notification = useWebSocketData<Notification>('notification')

  return (
    notification && (
      <div className={`notification notification-${notification.type}`}>
        {notification.message}
      </div>
    )
  )
}
```

### Live Presence

```typescript
import {
  useAutoConnectWebSocket,
  useWebSocketData,
  useWebSocketMessage,
} from '@/lib/redux/websocket'

interface Presence {
  userId: string
  username: string
  status: 'online' | 'away' | 'offline'
  lastSeen: number
}

export function PresenceIndicator({ userId }: { userId: string }) {
  useAutoConnectWebSocket()
  const presence = useWebSocketData<Presence>('presence:update')
  const sendMessage = useWebSocketMessage()

  useEffect(() => {
    // Notify server of presence
    sendMessage('presence:update', {
      status: 'online',
      lastSeen: Date.now(),
    })

    // Update every 30 seconds
    const interval = setInterval(() => {
      sendMessage('presence:update', {
        status: 'online',
        lastSeen: Date.now(),
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [sendMessage])

  return (
    <div>
      {presence && (
        <div>
          <span>{presence.username}</span>
          <span className={`status status-${presence.status}`} />
        </div>
      )}
    </div>
  )
}
```

## Server Integration

Your server should handle messages in this format:

```python
# Example with Python WebSocket server
import json
from websockets.server import serve

async def handler(websocket):
    async for message in websocket:
        data = json.loads(message)
        msg_type = data.get('type')
        msg_data = data.get('data')

        if msg_type == 'chat:send':
            # Handle chat message
            await broadcast({
                'type': 'chat:message',
                'data': {
                    'id': str(uuid.uuid4()),
                    'author': 'User',
                    'text': msg_data['text'],
                    'timestamp': int(time.time() * 1000)
                }
            })
```

## Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useWebSocket, useWebSocketSubscription } from '@/lib/redux/websocket'

describe('WebSocket Hooks', () => {
  it('should connect to WebSocket', async () => {
    const { result } = renderHook(() => useWebSocket())

    await act(async () => {
      await result.current.connect()
    })

    expect(result.current.isConnected).toBe(true)
  })

  it('should subscribe to messages', () => {
    const callback = jest.fn()
    const { unmount } = renderHook(() =>
      useWebSocketSubscription('test', callback)
    )

    // Simulate message receipt
    act(() => {
      callback({ test: 'data' })
    })

    expect(callback).toHaveBeenCalled()
    unmount()
  })
})
```

## Browser Support

The WebSocket integration uses the native `WebSocket` API, which is supported in all modern browsers and Node.js environments.

## License

Part of the SOGo6-UI project.
