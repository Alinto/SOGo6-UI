import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Notification, NotificationPayload } from './notifications-types'

interface NotificationsState {
  items: Notification[]
}

const initialState: NotificationsState = {
  items: [],
}

// Simple function to generate unique IDs
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // Add a new notification
    addNotification: (state, action: PayloadAction<NotificationPayload>) => {
      const { type, title, message, details, duration } = action.payload
      const notification: Notification = {
        id: generateId(),
        type,
        title,
        message,
        details,
        duration: duration ?? 5000, // Default 5 seconds
        timestamp: Date.now(),
      }
      state.items.push(notification)
    },

    // Remove notification by id
    removeNotification: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },

    // Clear all notifications
    clearAllNotifications: (state) => {
      state.items = []
    },

    // Clear notifications by type
    clearNotificationsByType: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.type !== action.payload)
    },
  },
})

export const {
  addNotification,
  removeNotification,
  clearAllNotifications,
  clearNotificationsByType,
} = notificationsSlice.actions

export default notificationsSlice.reducer
