/**
 * SSE Subscription Management Utilities
 * Helper functions for managing message subscriptions
 */

import { SSEMessage } from '../types'

export type MessageHandler<T = unknown> = (_message: SSEMessage<T>) => void

/**
 * Emit message to all subscribed handlers
 */
export function emitMessage<T = unknown>(
  subscriptions: Map<string, Set<MessageHandler>>,
  type: string,
  message: SSEMessage<T>
): void {
  const handlers = subscriptions.get(type)
  if (handlers) {
    handlers.forEach((handler) => {
      try {
        handler(message as SSEMessage)
      } catch (error) {
        console.error(`Error in message handler for type "${type}":`, error)
      }
    })
  }
}

/**
 * Subscribe to a specific message type
 */
export function subscribe<T = unknown>(
  subscriptions: Map<string, Set<MessageHandler>>,
  type: string,
  handler: MessageHandler<T>
): () => void {
  if (!subscriptions.has(type)) {
    subscriptions.set(type, new Set())
  }

  subscriptions.get(type)!.add(handler as MessageHandler)

  // Return unsubscribe function
  return () => {
    subscriptions.get(type)?.delete(handler as MessageHandler)
    if (subscriptions.get(type)?.size === 0) {
      subscriptions.delete(type)
    }
  }
}

/**
 * Clear all subscriptions
 */
export function clearSubscriptions(
  subscriptions: Map<string, Set<MessageHandler>>
): void {
  subscriptions.clear()
}

/**
 * Get subscription count for a type
 */
export function getSubscriptionCount(
  subscriptions: Map<string, Set<MessageHandler>>,
  type?: string
): number {
  if (type) {
    return subscriptions.get(type)?.size || 0
  }

  let total = 0
  subscriptions.forEach((handlers) => {
    total += handlers.size
  })
  return total
}
