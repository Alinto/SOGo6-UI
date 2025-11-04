/**
 * WebSocket Redux Integration - Main Entry Point
 */

// Types
export { WebSocketConnectionState } from './types'
export type {
  WebSocketConfig,
  WebSocketEvent,
  WebSocketMessage,
  WebSocketState,
} from './types'

// Service
export {
  WebSocketService,
  getWebSocketService,
  resetWebSocketService,
} from './websocket-service'

// Redux Slice
export {
  connectionError,
  connectionStateChanged,
  errorCleared,
  messagePending,
  messagePendingCleared,
  messageReceived,
  reconnectAttemptIncremented,
  reconnectAttemptsReset,
  selectIsWebSocketConnected,
  selectIsWebSocketConnecting,
  selectWebSocketError,
  selectWebSocketLastMessageReceived,
  selectWebSocketPendingMessages,
  selectWebSocketReconnectAttempts,
  selectWebSocketStatus,
  default as webSocketReducer,
} from './websocket-slice'

// Middleware
export {
  connectWebSocket,
  createWebSocketListener,
  createWebSocketMessageListener,
  disconnectWebSocket,
  getStoreInstance,
  getWebSocketServiceInstance,
  initializeWebSocketMiddleware,
  sendWebSocketMessage,
  setStoreInstance,
  setupWebSocketEventListener,
  subscribeToWebSocketConnectionState,
  subscribeToWebSocketMessage,
} from './websocket-middleware'

// Hooks
export {
  useAutoConnectWebSocket,
  useWebSocket,
  useWebSocketConnected,
  useWebSocketConnecting,
  useWebSocketConnectionState,
  useWebSocketData,
  useWebSocketError,
  useWebSocketLastMessageReceived,
  useWebSocketMessage,
  useWebSocketReconnectAttempts,
  useWebSocketStatus,
  useWebSocketSubscription,
} from './websocket-hooks'
