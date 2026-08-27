/**
 * SSE Service - Handles EventSource connection and message management
 */

import { SSEConfig, SSEConnectionState, SSEMessage } from './types'
import {
  calculateReconnectionDelay,
  createConnectionError,
  emitMessage as emitMessageUtil,
  handleDataEvent,
  handleMailReceived,
  handleMessage,
  handlePing,
  notifyError,
  notifyStateChange,
  subscribe as subscribeUtil,
  type ErrorHandler,
  type MessageHandler,
  type StateChangeHandler,
} from './utils'

export class SSEService {
  private eventSource: EventSource | null = null
  private config: SSEConfig
  private subscriptions: Map<string, Set<MessageHandler>> = new Map()
  private stateChangeHandlers: Set<StateChangeHandler> = new Set()
  private errorHandlers: Set<ErrorHandler> = new Set()
  private connectionState: SSEConnectionState = SSEConnectionState.DISCONNECTED
  private reconnectAttempts: number = 0
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null
  private heartbeatTimeout: ReturnType<typeof setTimeout> | null = null
  private messageCount: number = 0
  private lastMessageTime: number | null = null

  constructor(config: SSEConfig) {
    this.config = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      heartbeatTimeout: 30000,
      ...config,
    }
  }

  /**
   * Connect to SSE server
   */
  async connect(): Promise<void> {
    if (
      this.connectionState === SSEConnectionState.CONNECTED ||
      this.connectionState === SSEConnectionState.CONNECTING
    ) {
      return
    }

    this.setConnectionState(SSEConnectionState.CONNECTING)

    try {
      const url = new URL(this.config.url)
      this.eventSource = new EventSource(url.toString())

      this.eventSource.addEventListener('open', this.handleOpen.bind(this))
      this.eventSource.addEventListener('error', this.handleError.bind(this))
      this.eventSource.addEventListener(
        'message',
        this.handleMessage.bind(this)
      )
      this.eventSource.addEventListener(
        'mail:received',
        this.handleMailReceived.bind(this)
      )

      this.resetHeartbeat()
    } catch (error) {
      this.handleConnectionError(
        error instanceof Error
          ? error
          : new Error('Failed to connect to SSE server')
      )
    }
  }

  /**
   * Disconnect from SSE server
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close()
      this.eventSource = null
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
      this.reconnectTimeout = null
    }

    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
      this.heartbeatTimeout = null
    }

    this.setConnectionState(SSEConnectionState.CLOSED)
  }

  /**
   * Subscribe to a specific message type
   */
  subscribe<T = unknown>(type: string, handler: MessageHandler<T>): () => void {
    return subscribeUtil(this.subscriptions, type, handler as MessageHandler)
  }

  /**
   * Subscribe to connection state changes
   */
  onStateChange(handler: StateChangeHandler): () => void {
    this.stateChangeHandlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.stateChangeHandlers.delete(handler)
    }
  }

  /**
   * Subscribe to errors
   */
  onError(handler: ErrorHandler): () => void {
    this.errorHandlers.add(handler)

    // Return unsubscribe function
    return () => {
      this.errorHandlers.delete(handler)
    }
  }

  /**
   * Get current connection state
   */
  getState(): SSEConnectionState {
    return this.connectionState
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      state: this.connectionState,
      messageCount: this.messageCount,
      lastMessageTime: this.lastMessageTime,
      reconnectAttempts: this.reconnectAttempts,
    }
  }

  // Private methods

  private handleOpen(): void {
    this.reconnectAttempts = 0
    this.setConnectionState(SSEConnectionState.CONNECTED)
    this.resetHeartbeat()
  }

  private handleMessage(event: MessageEvent): void {
    this.lastMessageTime = Date.now()
    this.messageCount++
    this.resetHeartbeat()
    handleMessage(event, (message) => {
      this.emitMessage('message', message)
    })
  }

  private handleDataEvent(event: MessageEvent): void {
    this.lastMessageTime = Date.now()
    this.messageCount++
    this.resetHeartbeat()
    handleDataEvent(event, (message) => {
      this.emitMessage('data', message)
    })
  }

  private handlePing(event: MessageEvent): void {
    this.lastMessageTime = Date.now()
    this.resetHeartbeat()
    handlePing(event, (message) => {
      this.emitMessage('ping', message)
    })
  }

  private handleMailReceived(event: MessageEvent): void {
    this.lastMessageTime = Date.now()
    this.messageCount++
    this.resetHeartbeat()
    handleMailReceived(event, (message) => {
      this.emitMessage('mail:received', message)
    })
  }

  private handleError(event: Event): void {
    // Don't reconnect if we've already given up
    if (
      this.connectionState === SSEConnectionState.CLOSED ||
      this.reconnectAttempts >= 3
    ) {
      return
    }

    const error = createConnectionError(event)
    this.handleConnectionError(error)
  }

  private handleConnectionError(error: Error): void {
    this.setConnectionState(SSEConnectionState.ERROR)
    // Notify error subscribers
    notifyError(this.errorHandlers, error)

    // Attempt reconnection
    this.attemptReconnect()
  }

  private attemptReconnect(): void {
    // Max 3 reconnection attempts
    if (this.reconnectAttempts >= 13) {
      // Clean up any pending reconnection timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout)
        this.reconnectTimeout = null
      }

      // Close the EventSource completely
      if (this.eventSource) {
        this.eventSource.close()
        this.eventSource = null
      }

      // Clean up heartbeat timeout
      if (this.heartbeatTimeout) {
        clearTimeout(this.heartbeatTimeout)
        this.heartbeatTimeout = null
      }

      this.setConnectionState(SSEConnectionState.CLOSED)
      console.error(`Max reconnection attempts reached (3). Giving up.`)
      return
    }

    this.reconnectAttempts++
    this.setConnectionState(SSEConnectionState.RECONNECTING)

    const delay = calculateReconnectionDelay(
      this.reconnectAttempts,
      this.config.reconnectInterval || 5000
    )

    console.log(
      `Reconnection attempt ${this.reconnectAttempts}/3, waiting ${delay}ms...`
    )

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout)
    }

    this.reconnectTimeout = setTimeout(() => {
      this.connect()
    }, delay)
  }

  private emitMessage(type: string, message: SSEMessage): void {
    emitMessageUtil(this.subscriptions, type, message)
  }

  private setConnectionState(state: SSEConnectionState): void {
    if (this.connectionState === state) {
      return
    }

    this.connectionState = state

    notifyStateChange(this.stateChangeHandlers, state)
  }

  private resetHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout)
    }

    this.heartbeatTimeout = setTimeout(() => {
      if (this.connectionState === SSEConnectionState.CONNECTED) {
        this.handleConnectionError(
          new Error('Heartbeat timeout - no messages received')
        )
      }
    }, this.config.heartbeatTimeout || 30000)
  }
}

// Singleton instance management
let sseService: SSEService | null = null

export function getSSEService(config?: SSEConfig): SSEService {
  if (!sseService) {
    if (!config) {
      throw new Error(
        'SSE Service not initialized. Please provide config on first call.'
      )
    }
    sseService = new SSEService(config)
  }
  return sseService
}

export function resetSSEService(): void {
  if (sseService) {
    sseService.disconnect()
    sseService = null
  }
}

export function initializeSSEService(config: SSEConfig): SSEService {
  resetSSEService()
  sseService = new SSEService(config)
  return sseService
}
