/**
 * Server-Sent Events (SSE) Types and Interfaces
 */

export enum SSEConnectionState {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  RECONNECTING = 'RECONNECTING',
  ERROR = 'ERROR',
  CLOSED = 'CLOSED',
}

export interface SSEMessage<T = unknown> {
  type: string
  data: T
  timestamp: number
  id?: string
}

export interface SSEConfig {
  url: string
  reconnectInterval?: number
  maxReconnectAttempts?: number
  heartbeatTimeout?: number
  withCredentials?: boolean
  headers?: Record<string, string>
}

export interface SSEState {
  status: SSEConnectionState
  error: string | null
  lastMessageTime: number | null
  reconnectAttempts: number
  messageCount: number
}

export interface SSEEvent<T = unknown> {
  type: string
  payload: T
  timestamp: number
}
