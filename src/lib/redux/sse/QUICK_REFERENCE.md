# SSE Quick Reference

## Setup (One-time)

```typescript
// app/layout.tsx
import { initializeSSEMiddleware } from '@/lib/redux/sse'

useEffect(() => {
  initializeSSEMiddleware({
    url: 'http://localhost:8000/events',
  })
}, [])
```

## Most Common Patterns

### 1. Get Real-time Data (Easiest)

```typescript
const { data, loading, error } = useSSEData('notifications')
```

### 2. Listen to Specific Events

```typescript
useSSESubscription('chat:message', (message) => {
  console.log('New message:', message)
})
```

### 3. Check Connection Status

```typescript
const isConnected = useSSEConnected()
```

### 4. Manual Control

```typescript
const { connect, disconnect, state } = useSSE()
// connect() / disconnect()
```

### 5. Monitor Stats

```typescript
const { messageCount, reconnectAttempts } = useSSEStats()
```

### 6. Handle Errors

```typescript
useSSEError((error) => {
  console.error('SSE error:', error.message)
})
```

## Hooks Reference

| Hook                                 | Purpose                   | Returns                                                |
| ------------------------------------ | ------------------------- | ------------------------------------------------------ |
| `useSSE()`                           | Manual connection control | `{ state, connect, disconnect, isConnected, error }`   |
| `useAutoSSE()`                       | Auto-connect on mount     | `{ state, error, isConnected }`                        |
| `useSSESubscription(type, callback)` | Listen to event type      | void                                                   |
| `useSSEData(type)`                   | Get reactive data         | `{ data, loading, error }`                             |
| `useSSEConnected()`                  | Check if connected        | boolean                                                |
| `useSSEStats()`                      | Get connection stats      | `{ messageCount, reconnectAttempts, lastMessageTime }` |
| `useSSEError(onError?)`              | Handle errors             | Error or null                                          |

## Server Message Format

```json
{
  "type": "notifications",
  "data": {
    "id": 1,
    "message": "Hello"
  }
}
```

## Common Issues

| Problem                 | Solution                      |
| ----------------------- | ----------------------------- |
| Not connecting          | Check URL and CORS            |
| Reconnecting constantly | Increase `reconnectInterval`  |
| No heartbeat timeout    | Ensure server sends pings     |
| Memory leaks            | Hooks auto-cleanup            |
| stale-closure warnings  | Add dependencies to useEffect |
