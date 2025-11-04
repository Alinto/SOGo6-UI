/**
 * SSE Utilities - Central export point
 * Re-exports all utility functions and types
 */

// Message handlers
export {
  handleDataEvent,
  handleMailReceived,
  handleMessage,
  handlePing,
} from './message-handlers'

// State management
export {
  calculateReconnectionDelay,
  createConnectionError,
  notifyError,
  notifyStateChange,
  shouldAttemptReconnection,
  type ErrorHandler,
  type StateChangeHandler,
} from './state-management'

// Subscription management
export {
  clearSubscriptions,
  emitMessage,
  getSubscriptionCount,
  subscribe,
  type MessageHandler,
} from './subscription-management'
