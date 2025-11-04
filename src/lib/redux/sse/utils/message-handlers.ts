/**
 * SSE Message Handlers
 * Event handlers for various SSE message types
 */

import { SSEMessage } from '../types'

/**
 * Parse and format message event data
 */
export function handleMessage(
  event: MessageEvent,
  onParsed: (_message: SSEMessage) => void
): void {
  try {
    const data = JSON.parse(event.data)
    const message: SSEMessage = {
      type: 'message',
      data,
      timestamp: Date.now(),
    }

    onParsed(message)
  } catch {
    // If not JSON, treat as raw message
    const message: SSEMessage = {
      type: 'message',
      data: event.data,
      timestamp: Date.now(),
    }

    onParsed(message)
  }
}

/**
 * Handle data event
 */
export function handleDataEvent(
  event: MessageEvent,
  onParsed: (_message: SSEMessage) => void
): void {
  try {
    const data = JSON.parse(event.data)
    const message: SSEMessage = {
      type: 'data',
      data,
      timestamp: Date.now(),
    }

    onParsed(message)
  } catch {
    const message: SSEMessage = {
      type: 'data',
      data: event.data,
      timestamp: Date.now(),
    }

    onParsed(message)
  }
}

/**
 * Handle ping event
 */
export function handlePing(
  event: MessageEvent,
  onParsed: (_message: SSEMessage) => void
): void {
  const message: SSEMessage = {
    type: 'ping',
    data: event.data || {},
    timestamp: Date.now(),
  }

  onParsed(message)
}

/**
 * Handle mail received event
 */
export function handleMailReceived(
  event: MessageEvent,
  onParsed: (_message: SSEMessage) => void
): void {
  try {
    const parsed = JSON.parse(event.data)
    // Extract mail data from nested structure if present
    const mailData = parsed.data || parsed
    const message: SSEMessage = {
      type: 'mail:received',
      data: mailData,
      timestamp: Date.now(),
      id: event.lastEventId || `mail-${Date.now()}`,
    }

    onParsed(message)
  } catch {
    const message: SSEMessage = {
      type: 'mail:received',
      data: event.data,
      timestamp: Date.now(),
      id: event.lastEventId || `mail-${Date.now()}`,
    }

    onParsed(message)
  }
}
