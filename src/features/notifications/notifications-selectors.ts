import type { Notification } from './notifications-types'

interface NotificationsState {
  items: Notification[]
}

export const selectAllNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items

export const selectNotificationById = (id: string) => (state: { notifications: NotificationsState }) =>
  state.notifications.items.find((item) => item.id === id)

export const selectNotificationsByType = (type: string) => (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter((item) => item.type === type)

export const selectErrorNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter((item) => item.type === 'error')

export const selectSuccessNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter((item) => item.type === 'success')

export const selectInfoNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items.filter((item) => item.type === 'info')

export const selectHasNotifications = (state: { notifications: NotificationsState }) =>
  state.notifications.items.length > 0

export const selectNotificationsCount = (state: { notifications: NotificationsState }) =>
  state.notifications.items.length
