# WebSocket Integration - Quick Reference

## Installation

1. Files are in: `src/lib/redux/websocket/`
2. Update Redux store with: `websocket: webSocketReducer`
3. Initialize: `initializeWebSocketMiddleware({ url: 'ws://...' })`

## Essential Hooks

```typescript
// Connection
const { connect, disconnect, isConnected } = useWebSocket()
useAutoConnectWebSocket()

// Messages
const sendMessage = useWebSocketMessage()
useWebSocketSubscription<T>('type', callback)

// Data
const data = useWebSocketData<T>('message-type')

// Status
const isConnected = useWebSocketConnected()
const status = useWebSocketStatus()
const error = useWebSocketError()
```

## Basic Example

```typescript
import { useAutoConnectWebSocket, useWebSocketSubscription, useWebSocketMessage } from '@/lib/redux/websocket'

export function ChatApp() {
  useAutoConnectWebSocket()

  const [messages, setMessages] = useState([])
  const send = useWebSocketMessage()

  useWebSocketSubscription('chat:message', (msg) => {
    setMessages(prev => [...prev, msg])
  })

  return (
    <>
      {messages.map(m => <div key={m.id}>{m.text}</div>)}
      <button onClick={() => send('chat:send', { text: 'Hi!' })}>Send</button>
    </>
  )
}
```

## Message Format

```typescript
// Send
sendMessage('event-type', { payload: 'data' })

// Receive
{
  type: 'event-type',
  data: { payload: 'data' },
  timestamp: 1699999999000,
  id: 'unique-id'
}
```

## Configuration

```typescript
initializeWebSocketMiddleware({
  url: 'ws://localhost:8000/ws',
  reconnectAttempts: 5, // max retries
  reconnectDelay: 3000, // ms
  maxReconnectDelay: 30000, // ms
  heartbeatInterval: 30000, // ms
  messageTimeout: 5000, // ms
})
```

## Redux State

```typescript
import {
  selectWebSocketStatus,
  selectIsWebSocketConnected,
} from '@/lib/redux/websocket'

const status = useSelector(selectWebSocketStatus)
const isConnected = useSelector(selectIsWebSocketConnected)
```

## Advanced Patterns

### Manual Connection Control

```typescript
const { connect, disconnect, isConnected } = useWebSocket()

useEffect(() => {
  connect()
  return () => disconnect()
}, [connect, disconnect])
```

### Multiple Message Types

```typescript
useWebSocketSubscription('type1', handler1)
useWebSocketSubscription('type2', handler2)
useWebSocketSubscription('type3', handler3)
```

### Type-Safe Messages

```typescript
interface MyMessage {
  id: string
  content: string
}

useWebSocketSubscription<MyMessage>('my-event', (msg) => {
  console.log(msg.content) // TypeScript knows the shape
})
```

### Conditional Subscription

```typescript
const send = useWebSocketMessage()
const isConnected = useWebSocketConnected()

useWebSocketSubscription('event', (data) => {
  if (isConnected) {
    // Handle data
  }
})
```

## Connection States

```
DISCONNECTED → CONNECTING → CONNECTED
                              ↓
                         (every 30s: heartbeat)
                              ↓
                         (on disconnect)
                              ↓
                        RECONNECTING
```

## Error Handling

```typescript
const error = useWebSocketError()

if (error) {
  console.error('WebSocket error:', error)
}
```

## File Reference

| File                      | Purpose                 |
| ------------------------- | ----------------------- |
| `types.ts`                | TypeScript interfaces   |
| `websocket-service.ts`    | Core WebSocket logic    |
| `websocket-slice.ts`      | Redux state & selectors |
| `websocket-middleware.ts` | Redux middleware        |
| `websocket-hooks.ts`      | React hooks             |
| `index.ts`                | Main exports            |
| `examples.ts`             | Code examples           |
| `README.md`               | Full documentation      |
| `SETUP.md`                | Setup instructions      |

## Common Tasks

### Send a message

```typescript
const send = useWebSocketMessage()
send('type', { data: 'value' })
```

### Listen for messages

```typescript
useWebSocketSubscription('type', (data) => {
  console.log(data)
})
```

### Get reactive data

```typescript
const value = useWebSocketData('type')
// Updates whenever new message arrives
```

### Check connection

```typescript
const isConnected = useWebSocketConnected()
if (isConnected) {
  /* do something */
}
```

### Connect manually

```typescript
const { connect, disconnect } = useWebSocket()
await connect()
disconnect()
```

## Server Example (Node.js)

```typescript
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8000 })

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    const msg = JSON.parse(data)
    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong', data: {} }))
    } else {
      wss.clients.forEach((client) => {
        client.send(JSON.stringify(msg))
      })
    }
  })
})
```

## Troubleshooting

| Issue                 | Solution                           |
| --------------------- | ---------------------------------- |
| Not connecting        | Check URL, check server is running |
| Messages not received | Check message type matches exactly |
| Memory leaks          | Use hooks (they clean up)          |
| Connection drops      | Check heartbeat interval, firewall |
| Type errors           | Verify generic type in hook        |

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# .env.production
NEXT_PUBLIC_WS_URL=wss://your-domain.com/ws
```

## Import Paths

```typescript
// All exports from main index
import {
  useWebSocket,
  useWebSocketMessage,
  // ... other exports
} from '@/lib/redux/websocket'

// Or specific files
import { WebSocketService } from '@/lib/redux/websocket/websocket-service'
import webSocketReducer from '@/lib/redux/websocket/websocket-slice'
```

## Next Steps

1. ✅ Review [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md)
2. ✅ Follow [SETUP.md](./SETUP.md) for integration
3. ✅ Check [README.md](./README.md) for full API
4. ✅ See [examples.ts](./examples.ts) for code patterns
5. ✅ Start using in your components!

---

**Questions?** Check the full docs in [README.md](./README.md)
