export type { BackendResponse } from '@/lib/api/backend-response'

export interface ApiNotification {
  enabled: boolean
  notify_addresses: string[]
  notify_message: string
}

/** Legacy camelCase shape from older fakeApi responses */
export interface ApiNotificationLegacy {
  enabled?: boolean | 0 | 1
  notifyAddresses?: string[]
  notifyMessage?: string
}

export interface ApiNotificationGetResponse {
  notification: ApiNotification | ApiNotificationLegacy | null
}

export interface ApiNotificationPostResponse {
  filters: unknown
  forward: unknown
  vacation: unknown
  notification: ApiNotification | ApiNotificationLegacy | null
}

export interface ApiNotificationPostBody {
  Notification: ApiNotification
}
