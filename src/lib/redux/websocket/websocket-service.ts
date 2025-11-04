/**
 * WebSocket Service - Handles WebSocket connection and messaging
 */

import type {
  WebSocketConfig,
  WebSocketConnectionState,
  WebSocketMessage,
} from './types'
import { WebSocketConnectionState as ConnectionState } from './types'

export class WebSocketService {
  private ws: WebSocket | null = null
  private url: string
  private config: Required<WebSocketConfig>
  private isManualClose = false
  private reconnectAttempts = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimeout: ReturnType<typeof setInterval> | null = null
  private messageHandlers: Map<string, (_message: WebSocketMessage) => void> =
    new Map()
  private connectionStateCallbacks: Array<
    (_state: WebSocketConnectionState) => void
  > = []

  constructor(config: WebSocketConfig) {
    this.url = config.url
    this.config = {
      url: config.url,
      reconnectAttempts: config.reconnectAttempts ?? 5,
      reconnectDelay: config.reconnectDelay ?? 3000,
      maxReconnectDelay: config.maxReconnectDelay ?? 30000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      messageTimeout: config.messageTimeout ?? 5000,
    }
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.notifyConnectionState(ConnectionState.CONNECTING)
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          this.isManualClose = false
          this.reconnectAttempts = 0
          this.notifyConnectionState(ConnectionState.CONNECTED)
          this.startHeartbeat()
          resolve()
        }

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data)
        }

        this.ws.onerror = () => {
          this.notifyConnectionState(ConnectionState.FAILED)
          reject(new Error('WebSocket connection failed'))
        }

        this.ws.onclose = () => {
          this.stopHeartbeat()
          if (!this.isManualClose) {
            this.notifyConnectionState(ConnectionState.DISCONNECTED)
            this.attemptReconnect()
          }
        }
      } catch (error) {
        this.notifyConnectionState(ConnectionState.FAILED)
        reject(error)
      }
    })
  }

  /**
   * Send message to server
   */
  public send<T = unknown>(type: string, data: T): void {
    if (!this.isConnected()) {
      console.warn('WebSocket not connected, queuing message:', { type, data })
      return
    }

    const message: WebSocketMessage = {
      type,
      data,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random()}`,
    }

    this.ws?.send(JSON.stringify(message))
  }

  /**
   * Subscribe to message type
   */
  public on<T = unknown>(
    type: string,
    callback: (_data: T, _message?: WebSocketMessage) => void
  ): () => void {
    const handler = (message: WebSocketMessage) => {
      callback(message.data as T, message)
    }

    this.messageHandlers.set(type, handler)

    // Return unsubscribe function
    return () => {
      this.messageHandlers.delete(type)
    }
  }

  /**
   * Subscribe to connection state changes
   */
  public onConnectionStateChange(
    callback: (_state: WebSocketConnectionState) => void
  ): () => void {
    this.connectionStateCallbacks.push(callback)

    // Return unsubscribe function
    return () => {
      const index = this.connectionStateCallbacks.indexOf(callback)
      if (index > -1) {
        this.connectionStateCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Disconnect from WebSocket
   */
  public disconnect(): void {
    this.isManualClose = true
    this.stopHeartbeat()

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.ws) {
      this.ws.close()
      this.ws = null
    }

    this.notifyConnectionState(ConnectionState.DISCONNECTED)
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): WebSocketConnectionState {
    if (!this.ws) {
      return ConnectionState.DISCONNECTED
    }

    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return ConnectionState.CONNECTING
      case WebSocket.OPEN:
        return ConnectionState.CONNECTED
      case WebSocket.CLOSING:
      case WebSocket.CLOSED:
        return ConnectionState.DISCONNECTED
      default:
        return ConnectionState.DISCONNECTED
    }
  }

  /**
   * Handle incoming message
   */
  private handleMessage(data: string): void {
    try {
      const message: WebSocketMessage = JSON.parse(data)
      const handler = this.messageHandlers.get(message.type)

      if (handler) {
        handler(message)
      } else {
        // Emit to default handler if no specific handler
        const defaultHandler = this.messageHandlers.get('*')
        if (defaultHandler) {
          defaultHandler(message)
        }
      }
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error)
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.reconnectAttempts) {
      this.notifyConnectionState(ConnectionState.FAILED)
      return
    }

    this.reconnectAttempts++
    this.notifyConnectionState(ConnectionState.RECONNECTING)

    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    )

    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(() => {
        if (!this.isManualClose) {
          this.attemptReconnect()
        }
      })
    }, delay)
  }

  /**
   * Start heartbeat to keep connection alive
   */
  private startHeartbeat(): void {
    this.heartbeatTimeout = setInterval(() => {
      if (this.isConnected()) {
        this.send('ping', { timestamp: Date.now() })
      }
    }, this.config.heartbeatInterval)
  }

  /**
   * Stop heartbeat
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }
  }

  /**
   * Notify all callbacks of connection state change
   */
  private notifyConnectionState(state: WebSocketConnectionState): void {
    this.connectionStateCallbacks.forEach((callback) => {
      callback(state)
    })
  }
}

// Singleton instance
let wsServiceInstance: WebSocketService | null = null

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(
  config?: WebSocketConfig
): WebSocketService {
  if (!wsServiceInstance && config) {
    wsServiceInstance = new WebSocketService(config)
  }

  if (!wsServiceInstance) {
    throw new Error(
      'WebSocket service not initialized. Call getWebSocketService with config first.'
    )
  }

  return wsServiceInstance
}

/**
 * Reset WebSocket service instance
 */
export function resetWebSocketService(): void {
  if (wsServiceInstance) {
    wsServiceInstance.disconnect()
    wsServiceInstance = null
  }
}
