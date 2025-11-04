/**
 * WebSocket React Hooks
 * Easy-to-use hooks for WebSocket integration in React components
 */

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import type { WebSocketConnectionState, WebSocketMessage } from './types'
import {
  connectWebSocket,
  disconnectWebSocket,
  getWebSocketServiceInstance,
  sendWebSocketMessage,
} from './websocket-middleware'
import {
  selectIsWebSocketConnected,
  selectIsWebSocketConnecting,
  selectWebSocketError,
  selectWebSocketLastMessageReceived,
  selectWebSocketReconnectAttempts,
  selectWebSocketStatus,
} from './websocket-slice'

/**
 * Hook to get WebSocket connection status
 */
export function useWebSocketStatus(): WebSocketConnectionState {
  return useSelector(selectWebSocketStatus)
}

/**
 * Hook to check if WebSocket is connected
 */
export function useWebSocketConnected(): boolean {
  return useSelector(selectIsWebSocketConnected)
}

/**
 * Hook to check if WebSocket is connecting
 */
export function useWebSocketConnecting(): boolean {
  return useSelector(selectIsWebSocketConnecting)
}

/**
 * Hook to get WebSocket error
 */
export function useWebSocketError(): string | null {
  return useSelector(selectWebSocketError)
}

/**
 * Hook to get last message received timestamp
 */
export function useWebSocketLastMessageReceived(): number | null {
  return useSelector(selectWebSocketLastMessageReceived)
}

/**
 * Hook to get reconnect attempts count
 */
export function useWebSocketReconnectAttempts(): number {
  return useSelector(selectWebSocketReconnectAttempts)
}

/**
 * Hook to connect/disconnect WebSocket
 * Usage: const { connect, disconnect, isConnected } = useWebSocket()
 */
export function useWebSocket() {
  const isConnected = useWebSocketConnected()
  const isConnecting = useWebSocketConnecting()

  const connect = useCallback(async () => {
    try {
      await connectWebSocket()
    } catch (error) {
      console.error('Failed to connect WebSocket:', error)
    }
  }, [])

  const disconnect = useCallback(() => {
    disconnectWebSocket()
  }, [])

  return {
    connect,
    disconnect,
    isConnected,
    isConnecting,
    isLoading: isConnecting,
  }
}

/**
 * Hook to send WebSocket message
 * Usage: const sendMessage = useWebSocketMessage()
 *        sendMessage('message-type', { foo: 'bar' })
 */
export function useWebSocketMessage() {
  return useCallback(<T = unknown>(type: string, data: T) => {
    sendWebSocketMessage(type, data)
  }, [])
}

/**
 * Hook to subscribe to WebSocket messages of a specific type
 * Usage: useWebSocketSubscription('message-type', (data) => {
 *   console.log('Received:', data)
 * })
 */
export function useWebSocketSubscription<T = unknown>(
  type: string,
  callback: (_data: T, _message?: WebSocketMessage) => void
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const wsService = getWebSocketServiceInstance()
    if (!wsService) {
      console.warn('WebSocket service not initialized')
      return
    }

    const unsubscribe = wsService.on<T>(type, (data, message) => {
      callbackRef.current(data, message)
    })

    return () => {
      unsubscribe()
    }
  }, [type])
}

/**
 * Hook to subscribe to WebSocket connection state changes
 * Usage: useWebSocketConnectionState((state) => {
 *   console.log('Connection state:', state)
 * })
 */
export function useWebSocketConnectionState(
  callback: (_state: WebSocketConnectionState) => void
) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const wsService = getWebSocketServiceInstance()
    if (!wsService) {
      console.warn('WebSocket service not initialized')
      return
    }

    const unsubscribe = wsService.onConnectionStateChange((state) => {
      callbackRef.current(state)
    })

    return () => {
      unsubscribe()
    }
  }, [])
}

/**
 * Hook to automatically connect/disconnect WebSocket on mount/unmount
 * Usage: useAutoConnectWebSocket()
 */
export function useAutoConnectWebSocket(options?: {
  autoConnect?: boolean
  autoDisconnect?: boolean
}) {
  const { autoConnect = true, autoDisconnect = true } = options ?? {}
  const { connect, disconnect, isConnected } = useWebSocket()

  useEffect(() => {
    if (autoConnect && !isConnected) {
      connect()
    }

    return () => {
      if (autoDisconnect) {
        disconnect()
      }
    }
  }, [autoConnect, autoDisconnect, connect, disconnect, isConnected])

  return { isConnected }
}

/**
 * Hook to handle message with automatic subscription and typing
 * Usage: const data = useWebSocketData('notification')
 */
export function useWebSocketData<T = unknown>(
  messageType: string,
  initialData?: T
): T | undefined {
  const [data, setData] = useState<T | undefined>(initialData)

  useWebSocketSubscription<T>(messageType, (newData) => {
    setData(newData)
  })

  return data
}
