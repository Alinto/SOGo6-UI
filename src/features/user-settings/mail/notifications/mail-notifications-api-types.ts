export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiNotification {
  enabled: 0 | 1
  notifyAddresses: string[]
  notifyMessage: string
}

export interface ApiNotificationGetResponse {
  notification: ApiNotification | null
}

export interface ApiNotificationPostResponse {
  filters: unknown
  forward: unknown
  vacation: unknown
  notification: ApiNotification | null
}

export interface ApiNotificationPostBody {
  Notification: ApiNotification
}
