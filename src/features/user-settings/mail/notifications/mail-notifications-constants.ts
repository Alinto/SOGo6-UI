import type { MailNotification } from './mail-notifications-type'

export const MAX_NOTIFY_ADDRESSES = 10

export const DEFAULT_NOTIFICATION: MailNotification = {
  enabled: false,
  addresses: [],
  message: '',
}
