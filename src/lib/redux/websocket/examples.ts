/**
 * Example WebSocket Integration Component
 * Shows how to use WebSocket with RTK Redux
 */

'use client'

import { useEffect, useState } from 'react'
import {
  useAutoConnectWebSocket,
  useWebSocket,
  useWebSocketConnected,
  useWebSocketConnecting,
  useWebSocketData,
  useWebSocketError,
  useWebSocketMessage,
  useWebSocketSubscription,
} from '@/lib/redux/websocket'

// Example message types
interface ChatMessage {
  id: string
  author: string
  text: string
  timestamp: number
}

interface SystemNotification {
  id: string
  type: 'info' | 'warning' | 'error' | 'success'
  message: string
  timestamp: number
}

interface UserPresence {
  userId: string
  username: string
  status: 'online' | 'away' | 'offline'
  lastSeen: number
}

/**
 * Example: Real-time Chat Component
 */
export function ChatExample() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')

  // Auto connect on mount, disconnect on unmount
  useAutoConnectWebSocket({ autoConnect: true, autoDisconnect: true })

  // Get the function to send messages
  const sendMessage = useWebSocketMessage()

  // Subscribe to incoming chat messages
  useWebSocketSubscription<ChatMessage>('chat:message', (message) => {
    setMessages((prev) => [...prev, message])
  })

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage('chat:send', {
        text: inputValue,
        timestamp: Date.now(),
      })
      setInputValue('')
    }
  }

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <strong>{msg.author}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSendMessage()
            }
          }}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  )
}

/**
 * Example: Notification Center Component
 */
export function NotificationCenterExample() {
  const [notifications, setNotifications] = useState<SystemNotification[]>([])

  // Auto connect on mount
  useAutoConnectWebSocket()

  // Subscribe to system notifications
  useWebSocketSubscription<SystemNotification>('notification', (notification) => {
    setNotifications((prev) => [...prev, notification])
    // Auto-remove notifications after 5 seconds
    setTimeout(() => {
      setNotifications((prev) =>
        prev.filter((n) => n.id !== notification.id)
      )
    }, 5000)
  })

  return (
    <div className="notification-center">
      {notifications.map((notif) => (
        <div key={notif.id} className={`notification notification-${notif.type}`}>
          {notif.message}
        </div>
      ))}
    </div>
  )
}

/**
 * Example: Connection Status Indicator
 */
export function ConnectionStatusExample() {
  const isConnected = useWebSocketConnected()
  const isConnecting = useWebSocketConnecting()
  const error = useWebSocketError()

  return (
    <div className="connection-status">
      {isConnecting && <span className="status-badge connecting">Connecting...</span>}
      {isConnected && <span className="status-badge connected">Connected ✓</span>}
      {!isConnected && !isConnecting && (
        <span className="status-badge disconnected">Disconnected</span>
      )}
      {error && <span className="error-badge">{error}</span>}
    </div>
  )
}

/**
 * Example: Reactive Data Component
 */
export function ReactiveDataExample() {
  // Get reactive data that updates whenever a 'user:status' message is received
  const userStatus = useWebSocketData<UserPresence>('user:status')

  if (!userStatus) {
    return <div>Loading user status...</div>
  }

  return (
    <div className="user-status">
      <div className="user-info">
        <h3>{userStatus.username}</h3>
        <span className={`status-indicator status-${userStatus.status}`}>
          {userStatus.status}
        </span>
      </div>
      <p>Last seen: {new Date(userStatus.lastSeen).toLocaleString()}</p>
    </div>
  )
}

/**
 * Example: Advanced Usage with Multiple Subscriptions
 */
export function AdvancedWebSocketExample() {
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [notifications, setNotifications] = useState<SystemNotification[]>([])
  const [onlineUsers, setOnlineUsers] = useState<UserPresence[]>([])

  // Connection hooks
  const isConnected = useWebSocketConnected()
  const isConnecting = useWebSocketConnecting()
  const error = useWebSocketError()
  const sendMessage = useWebSocketMessage()

  // Auto connect/disconnect
  useAutoConnectWebSocket()

  // Subscribe to chat messages
  useWebSocketSubscription<ChatMessage>('chat:message', (message) => {
    setChatMessages((prev) => [...prev, message])
  })

  // Subscribe to notifications
  useWebSocketSubscription<SystemNotification>('notification', (notification) => {
    setNotifications((prev) => [...prev, notification])
  })

  // Subscribe to presence updates
  useWebSocketSubscription<UserPresence>('presence:update', (presence) => {
    setOnlineUsers((prev) => {
      const index = prev.findIndex((u) => u.userId === presence.userId)
      if (index > -1) {
        const updated = [...prev]
        updated[index] = presence
        return updated
      }
      return [...prev, presence]
    })
  })

  // Send initial presence on connect
  useEffect(() => {
    if (isConnected) {
      sendMessage('presence:update', {
        status: 'online',
        lastSeen: Date.now(),
      })

      // Update presence every 30 seconds
      const interval = setInterval(() => {
        sendMessage('presence:update', {
          status: 'online',
          lastSeen: Date.now(),
        })
      }, 30000)

      return () => clearInterval(interval)
    }
  }, [isConnected, sendMessage])

  return (
    <div className="advanced-websocket-example">
      {/* Status */}
      <div className="status-bar">
        <span>Status: {isConnected ? '✓ Connected' : isConnecting ? 'Connecting...' : '✗ Disconnected'}</span>
        {error && <span className="error">{error}</span>}
      </div>

      {/* Online Users */}
      <div className="online-users">
        <h3>Online Users ({onlineUsers.length})</h3>
        <ul>
          {onlineUsers.map((user) => (
            <li key={user.userId} className={`user-${user.status}`}>
              {user.username}
            </li>
          ))}
        </ul>
      </div>

      {/* Notifications */}
      <div className="notifications">
        <h3>Notifications ({notifications.length})</h3>
        <ul>
          {notifications.map((notif) => (
            <li key={notif.id} className={`notification-${notif.type}`}>
              {notif.message}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Messages */}
      <div className="chat-messages">
        <h3>Recent Messages ({chatMessages.length})</h3>
        <ul>
          {chatMessages.slice(-10).map((msg) => (
            <li key={msg.id}>
              <strong>{msg.author}:</strong> {msg.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/**
 * Example: Manual Connection Control
 */
export function ManualConnectionExample() {
  const { connect, disconnect, isConnected, isConnecting } = useWebSocket()

  return (
    <div className="manual-connection">
      <div>Status: {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}</div>
      <button onClick={() => connect()} disabled={isConnected || isConnecting}>
        Connect
      </button>
      <button onClick={() => disconnect()} disabled={!isConnected}>
        Disconnect
      </button>
    </div>
  )
}
