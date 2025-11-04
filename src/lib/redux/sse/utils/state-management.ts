/**
 * SSE State Management Utilities
 * Helper functions for managing connection state and timeouts
 */

import { SSEConnectionState } from '../types'

export interface StateChangeHandler {
  (_state: SSEConnectionState): void
}

export interface ErrorHandler {
  (_error: Error): void
}

/**
 * Notify state change subscribers
 */
export function notifyStateChange(
  handlers: Set<StateChangeHandler>,
  state: SSEConnectionState
): void {
  handlers.forEach((handler) => {
    try {
      handler(state)
    } catch (error) {
      console.error('Error in state change handler:', error)
    }
  })
}

/**
 * Notify error subscribers
 */
export function notifyError(handlers: Set<ErrorHandler>, error: Error): void {
  handlers.forEach((handler) => {
    try {
      handler(error)
    } catch (err) {
      console.error('Error in error handler:', err)
    }
  })
}

/**
 * Create error message for connection errors
 */
export function createConnectionError(event: Event): Error {
  return new Error(`SSE Connection error: ${event.type || 'Unknown error'}`)
}

/**
 * Calculate reconnection delay with exponential backoff
 */
export function calculateReconnectionDelay(
  reconnectAttempts: number,
  baseInterval: number
): number {
  return baseInterval * reconnectAttempts
}

/**
 * Check if should attempt reconnection
 */
export function shouldAttemptReconnection(
  currentAttempts: number,
  maxAttempts: number
): boolean {
  return currentAttempts < maxAttempts
}
