export type NotificationType = 'error' | 'success' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // in milliseconds, if 0 or undefined, notification won't auto-dismiss
  timestamp: number
}

export interface NotificationPayload {
  type: NotificationType
  title: string
  message: string
  duration?: number
}
