/**
 * WebSocket Redux Slice
 */

import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import type { WebSocketEvent, WebSocketState } from './types'
import { WebSocketConnectionState } from './types'

const initialState: WebSocketState = {
  status: WebSocketConnectionState.DISCONNECTED,
  isConnected: false,
  isConnecting: false,
  error: null,
  lastMessageReceived: null,
  reconnectAttempts: 0,
  pendingMessages: [],
}

export const webSocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Connection state actions
    connectionStateChanged: (
      state,
      action: PayloadAction<WebSocketConnectionState>
    ) => {
      state.status = action.payload
      state.isConnected = action.payload === WebSocketConnectionState.CONNECTED
      state.isConnecting =
        action.payload === WebSocketConnectionState.CONNECTING ||
        action.payload === WebSocketConnectionState.RECONNECTING
      state.error = null
    },

    // Error handling
    connectionError: (state, action: PayloadAction<string>) => {
      state.status = WebSocketConnectionState.FAILED
      state.error = action.payload
      state.isConnected = false
      state.isConnecting = false
    },

    // Message received
    messageReceived: (state, action: PayloadAction<WebSocketEvent>) => {
      state.lastMessageReceived = action.payload.timestamp
    },

    // Reconnect attempts
    reconnectAttemptIncremented: (state) => {
      state.reconnectAttempts += 1
    },

    reconnectAttemptsReset: (state) => {
      state.reconnectAttempts = 0
    },

    // Pending messages
    messagePending: (state, action: PayloadAction<unknown>) => {
      state.pendingMessages.push(action.payload as never)
    },

    messagePendingCleared: (state) => {
      state.pendingMessages = []
    },

    // Clear error
    errorCleared: (state) => {
      state.error = null
    },
  },
})

export const {
  connectionStateChanged,
  connectionError,
  messageReceived,
  reconnectAttemptIncremented,
  reconnectAttemptsReset,
  messagePending,
  messagePendingCleared,
  errorCleared,
} = webSocketSlice.actions

export default webSocketSlice.reducer

// Selectors
export const selectWebSocketStatus = (state: { websocket: WebSocketState }) =>
  state.websocket.status

export const selectIsWebSocketConnected = (state: {
  websocket: WebSocketState
}) => state.websocket.isConnected

export const selectIsWebSocketConnecting = (state: {
  websocket: WebSocketState
}) => state.websocket.isConnecting

export const selectWebSocketError = (state: { websocket: WebSocketState }) =>
  state.websocket.error

export const selectWebSocketLastMessageReceived = (state: {
  websocket: WebSocketState
}) => state.websocket.lastMessageReceived

export const selectWebSocketReconnectAttempts = (state: {
  websocket: WebSocketState
}) => state.websocket.reconnectAttempts

export const selectWebSocketPendingMessages = (state: {
  websocket: WebSocketState
}) => state.websocket.pendingMessages
