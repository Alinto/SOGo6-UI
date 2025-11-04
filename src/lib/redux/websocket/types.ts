/**
 * WebSocket Event Types and State Management
 */

export enum WebSocketConnectionState {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed',
}

export interface WebSocketMessage<T = unknown> {
  type: string
  data: T
  timestamp?: number
  id?: string
}

export interface WebSocketConfig {
  url: string
  reconnectAttempts?: number
  reconnectDelay?: number
  maxReconnectDelay?: number
  heartbeatInterval?: number
  messageTimeout?: number
}

export interface WebSocketState {
  status: WebSocketConnectionState
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  lastMessageReceived: number | null
  reconnectAttempts: number
  pendingMessages: WebSocketMessage[]
}

export interface WebSocketEvent<T = unknown> {
  type: string
  payload: T
  timestamp: number
}
