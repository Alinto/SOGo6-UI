/**
 * WebSocket Listener Middleware
 * Integrates WebSocket events with Redux actions and state management
 */

import { configureStore } from '@reduxjs/toolkit'
import type { AppStartListening } from '../listener-middleware'
import type { RootState } from '../store'
import type {
  WebSocketConfig,
  WebSocketConnectionState,
  WebSocketMessage,
} from './types'
import { WebSocketConnectionState as ConnectionState } from './types'
import { getWebSocketService, type WebSocketService } from './websocket-service'
import {
  connectionError,
  connectionStateChanged,
  messageReceived,
  reconnectAttemptIncremented,
  reconnectAttemptsReset,
} from './websocket-slice'

let wsService: WebSocketService | null = null

/**
 * Initialize WebSocket middleware
 * Call this once when setting up the store
 */
export function initializeWebSocketMiddleware(config: WebSocketConfig) {
  wsService = getWebSocketService(config)

  // Subscribe to connection state changes
  wsService.onConnectionStateChange((state) => {
    const store = getStoreInstance()
    if (store) {
      store.dispatch(connectionStateChanged(state))

      if (state === ConnectionState.RECONNECTING) {
        store.dispatch(reconnectAttemptIncremented())
      } else if (state === ConnectionState.CONNECTED) {
        store.dispatch(reconnectAttemptsReset())
      }
    }
  })

  // Handle ping/pong for heartbeat
  wsService.on('pong', () => {
    // Heartbeat response received
  })
}

/**
 * Create listener for WebSocket messages of a specific type
 */
export function createWebSocketMessageListener<T = unknown>(
  messageType: string,
  onMessage: (_data: T, _state: RootState) => void
) {
  return (startListening: AppStartListening) => {
    startListening({
      predicate: (action: unknown) =>
        messageReceived.match(action) &&
        (action as ReturnType<typeof messageReceived>).payload.type ===
          messageType,
      effect: (_action: unknown, { getState: _getState }) => {
        const store = getStoreInstance()
        if (!store) return

        // Subscribe to this message type if not already subscribed
        const wsService = getWebSocketService()
        wsService?.on<T>(messageType, (data) => {
          onMessage(data, store.getState())
        })
      },
    })
  }
}

/**
 * Connect WebSocket
 */
export async function connectWebSocket(): Promise<void> {
  if (!wsService) {
    throw new Error(
      'WebSocket service not initialized. Call initializeWebSocketMiddleware first.'
    )
  }

  try {
    await wsService.connect()
  } catch (error) {
    const store = getStoreInstance()
    if (store) {
      store.dispatch(
        connectionError(
          error instanceof Error ? error.message : 'Connection failed'
        )
      )
    }
    throw error
  }
}

/**
 * Disconnect WebSocket
 */
export function disconnectWebSocket(): void {
  if (wsService) {
    wsService.disconnect()
  }
}

/**
 * Send message through WebSocket
 */
export function sendWebSocketMessage<T = unknown>(type: string, data: T): void {
  if (!wsService) {
    throw new Error('WebSocket service not initialized')
  }

  wsService.send(type, data)
}

/**
 * Subscribe to WebSocket message type
 */
export function subscribeToWebSocketMessage<T = unknown>(
  type: string,
  callback: (_data: T, _message?: WebSocketMessage) => void
): () => void {
  if (!wsService) {
    throw new Error('WebSocket service not initialized')
  }

  return wsService.on(type, callback)
}

/**
 * Subscribe to connection state changes
 */
export function subscribeToWebSocketConnectionState(
  callback: (_state: WebSocketConnectionState) => void
): () => void {
  if (!wsService) {
    throw new Error('WebSocket service not initialized')
  }

  return wsService.onConnectionStateChange(callback)
}

/**
 * Get WebSocket service instance
 */
export function getWebSocketServiceInstance(): WebSocketService | null {
  return wsService
}

/**
 * Store instance reference (set by listener middleware)
 */
let storeInstance: ReturnType<typeof configureStore> | null = null

export function setStoreInstance(store: ReturnType<typeof configureStore>) {
  storeInstance = store
}

export function getStoreInstance() {
  return storeInstance
}

/**
 * Create and setup listener middleware for WebSocket
 * Usage in store.ts:
 *
 * const unsubscribeWebSocket = webSocketListener(startAppListening)
 */
export function createWebSocketListener(startListening: AppStartListening) {
  return () => {
    // Listen for connection state changes and dispatch side effects
    startListening({
      predicate: (action: unknown) => connectionStateChanged.match(action),
      effect: (_action: unknown) => {
        // Handle different connection states if needed
        console.log('WebSocket connection state changed')
      },
    })
  }
}

/**
 * Example: Create a listener for a specific message type
 * Usage:
 *
 * const handleNotification = createWebSocketMessageListener('notification', (data, state) => {
 *   console.log('Received notification:', data)
 * })
 */
export function setupWebSocketEventListener<T = unknown>(
  messageType: string,
  onMessage: (_data: T, _state: RootState) => void,
  startListening: AppStartListening
) {
  startListening({
    predicate: (action: unknown) => messageReceived.match(action),
    effect: () => {
      const store = getStoreInstance()
      if (!store) return

      subscribeToWebSocketMessage<T>(messageType, (data) => {
        onMessage(data, store.getState())
      })
    },
  })
}
