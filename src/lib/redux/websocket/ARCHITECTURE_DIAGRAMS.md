# WebSocket Integration - Visual Guide

## 📊 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     React Components                             │
│  (Your chat, notifications, real-time data components)          │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ imports from

┌─────────────────────────────────────────────────────────────────┐
│                      React Hooks Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  useAutoConnectWebSocket()                              │   │
│  │  useWebSocketSubscription()                             │   │
│  │  useWebSocketMessage()                                  │   │
│  │  useWebSocketData()                                     │   │
│  │  useWebSocketConnected(), useWebSocketError(), ...      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ dispatches & selects from

┌─────────────────────────────────────────────────────────────────┐
│                    Redux Store                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  websocket: {                                           │   │
│  │    status: 'connected',                                 │   │
│  │    isConnected: true,                                   │   │
│  │    error: null,                                         │   │
│  │    reconnectAttempts: 0,                                │   │
│  │    ...                                                  │   │
│  │  }                                                      │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ middleware & listener

┌─────────────────────────────────────────────────────────────────┐
│                  Listener Middleware                             │
│  (RTK Listener Middleware)                                       │
│  Handles:                                                        │
│  • Connection state changes                                      │
│  • Message routing                                              │
│  • Reconnection logic                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ controls

┌─────────────────────────────────────────────────────────────────┐
│                 WebSocket Service                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  • Connection management                                │   │
│  │  • Message serialization                                │   │
│  │  • Reconnection with backoff                            │   │
│  │  • Heartbeat/keep-alive                                 │   │
│  │  • Message routing                                      │   │
│  │  • Event subscriptions                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ uses

┌─────────────────────────────────────────────────────────────────┐
│            Native WebSocket API                                  │
│  (Browser WebSocket / Node.js ws)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ↓ communicates with

┌─────────────────────────────────────────────────────────────────┐
│                   WebSocket Server                               │
│  (Your backend - Node.js, Python, Go, etc.)                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Message Flow Diagram

```
CLIENT                                          SERVER
  │                                               │
  ├─── Initialize ──────────────────────────────→│
  │    WebSocket                                 │
  │                                              │
  │←─── Success ──────────────────────────────────┤
  │                                              │
  ├─── heartbeat (ping) every 30s ──────────────→│
  │                                              │
  │←─── heartbeat (pong) ───────────────────────┤
  │                                              │
  ├─ sendMessage('event', data) ───────────────→│
  │    { type: 'event', data: {...} }           │
  │                                              │
  │                      Server processes...     │
  │                      Broadcasts to all       │
  │                                              │
  │←─ receiveMessage('event', data) ────────────┤
  │    { type: 'event', data: {...} }           │
  │    Redux action triggered                   │
  │    Components re-render                     │
  │                                              │
  ├─ Connection lost                            │
  │    Reconnecting...                          │
  │    (exponential backoff)                    │
  │    ├─ retry 1 (3s) ──────────────────────→ X
  │    ├─ retry 2 (6s) ──────────────────────→ X
  │    ├─ retry 3 (12s) ──────────────────────→ ✓
  │                                              │
  │←─── Reconnected ───────────────────────────→│
```

## 🏗️ Data Flow Diagram

```
User Action
    │
    ↓
Component Event Handler
    │
    ├─→ useWebSocketMessage() sends
    │       ↓
    │   sendWebSocketMessage('type', data)
    │       ↓
    │   WebSocket.send(JSON.stringify(message))
    │       ↓
    │   Server receives & processes
    │       ↓
    │   Server broadcasts to clients
    │
    └─→ Server sends response
            ↓
        WebSocket.onmessage
            ↓
        parseMessage & dispatch to Redux
            ↓
        Redux action: messageReceived
            ↓
        Listener middleware triggers
            ↓
        User subscription callback
            ↓
        Component state updates
            ↓
        Component re-renders
            ↓
        UI updates
```

## 🔐 State Management Diagram

```
Redux Store
├── websocket
│   ├── status: 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'failed'
│   ├── isConnected: boolean
│   ├── isConnecting: boolean
│   ├── error: string | null
│   ├── lastMessageReceived: number | null
│   ├── reconnectAttempts: number
│   └── pendingMessages: WebSocketMessage[]
│
├── api (RTK Query)
├── auth
├── ...other slices
```

## 🎣 Hook Relationships

```
useWebSocket()
    ├── uses: Redux dispatch & selectors
    ├── returns: { connect, disconnect, isConnected, isConnecting, isLoading }
    └── effects: connects/disconnects WebSocket

useAutoConnectWebSocket(options)
    ├── calls: useWebSocket() internally
    ├── auto-connects on mount
    ├── auto-disconnects on unmount
    └── returns: { isConnected }

useWebSocketSubscription(type, callback)
    ├── registers listener with WebSocket service
    ├── handles message routing
    ├── cleanup: unsubscribes on unmount
    └── effects: none (only subscriptions)

useWebSocketMessage()
    ├── uses: WebSocket service
    ├── returns: (type, data) => void function
    └── effects: sends message immediately

useWebSocketData(type, initialData)
    ├── uses: useState + useWebSocketSubscription
    ├── returns: current data value
    └── effects: updates state on message

useWebSocketStatus()
    ├── uses: Redux selector
    ├── returns: connection status string
    └── effects: none

useWebSocketConnected()
    ├── uses: Redux selector
    ├── returns: boolean
    └── effects: none

useWebSocketError()
    ├── uses: Redux selector
    ├── returns: error string or null
    └── effects: none
```

## 📝 Message Protocol Diagram

```
Sending:
┌─────────────────────────────────────┐
│  useWebSocketMessage()              │
│        ↓                            │
│  send('chat:send', {text: '...'})   │
│        ↓                            │
│  WebSocket.send(JSON.stringify({    │
│    type: 'chat:send',               │
│    data: {text: '...'},             │
│    timestamp: 1699999999000,        │
│    id: 'unique-id'                  │
│  }))                                │
└─────────────────────────────────────┘

Receiving:
┌─────────────────────────────────────┐
│  WebSocket.onmessage({data})        │
│        ↓                            │
│  JSON.parse(data)                   │
│        ↓                            │
│  { type, data, timestamp, id }      │
│        ↓                            │
│  Redux: messageReceived(message)    │
│        ↓                            │
│  Listener middleware matches type   │
│        ↓                            │
│  Route to subscribers               │
│        ↓                            │
│  Callback(data)                     │
│        ↓                            │
│  Component updates                  │
└─────────────────────────────────────┘
```

## 🔄 Connection State Machine

```
                    ┌─────────────────┐
                    │   DISCONNECTED  │
                    └────────┬────────┘
                             │
                             ↓ connect()
                    ┌─────────────────┐
                    │   CONNECTING    │
                    └────────┬────────┘
                      ✓      │      ✗
                      ↓      │      ↓
        ┌────────────────────┼────────────────┐
        ↓                    ↓                ↓
   ┌─────────────┐  ┌──────────────┐  ┌─────────────┐
   │  CONNECTED  │  │  DISCONNECTED │  │   FAILED    │
   └─────┬───────┘  └──────────────┘  └─────┬───────┘
         │ (connection lost)                │
         ↓                                  ↓
   ┌──────────────┐                  ┌─────────────────┐
   │ RECONNECTING │◄─────(retry)────│ max attempts    │
   └──────┬───────┘                  │ exceeded        │
          │ ✓                        └─────────────────┘
          ↓
     CONNECTED
     ↓ (back to normal)
   (every 30s heartbeat
    keeps alive)
```

## 🎯 Component Integration Flow

```
MyComponent.tsx
│
├── useAutoConnectWebSocket()
│   └─→ Connect on mount, disconnect on unmount
│
├── useWebSocketSubscription('event', callback)
│   └─→ Register listener, receive & handle messages
│
├── useWebSocketMessage()
│   └─→ Get send function for sending messages
│
├── useState() & local state updates
│   └─→ Handle UI state changes
│
└── JSX render
    └─→ Display data from both Redux + local state
```

## 💻 Redux DevTools Integration

```
Redux DevTools will show:

Actions:
├── websocket/connectionStateChanged
│   └── payload: 'connecting' | 'connected' | 'disconnected' | 'reconnecting' | 'failed'
│
├── websocket/messageReceived
│   └── payload: { type, data, timestamp, id }
│
├── websocket/reconnectAttemptIncremented
│   └── payload: void
│
├── websocket/reconnectAttemptsReset
│   └── payload: void
│
├── websocket/connectionError
│   └── payload: error message
│
└── ... other actions

State:
websocket: {
  status: string
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastMessageReceived: number | null
  reconnectAttempts: number
  pendingMessages: WebSocketMessage[]
}
```

## 📱 Component Hierarchy Example

```
App
├── RootLayout (initializes WebSocket)
│   ├── StoreProvider
│   └── ThemeProvider
│
├── ChatPage
│   ├── ChatHeader
│   │   └── useWebSocketConnected()
│   │       → Shows: "Connected ✓" / "Connecting..." / "Disconnected"
│   │
│   ├── MessageList
│   │   └── useWebSocketSubscription('chat:message')
│   │       → Displays messages
│   │
│   └── MessageInput
│       └── useWebSocketMessage()
│           → Sends messages
```

## 🔐 Security & Error Handling Flow

```
Initialize
    │
    ├─→ Connection Error
    │   └─→ connectionError action → Redux
    │       └─→ Component gets error via selector
    │           └─→ Display error UI
    │
    ├─→ Message Error
    │   └─→ Try/catch in message handler
    │       └─→ Log error
    │           └─→ Continue processing
    │
    ├─→ Reconnection Error
    │   └─→ Retry with exponential backoff
    │       └─→ If all retries fail
    │           └─→ Set status to FAILED
    │               └─→ Notify user
    │
    └─→ Connection Lost
        └─→ Automatic reconnection triggered
            └─→ Notify user of reconnecting state
                └─→ On success: back to normal
                └─→ On failure: try again with backoff
```

---

These diagrams show how all the pieces fit together to create a complete real-time WebSocket system integrated with Redux Toolkit and React hooks.

**See SETUP.md for step-by-step integration instructions.**
