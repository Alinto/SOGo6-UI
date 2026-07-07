import type { ApiNotification } from './mail-notifications-api-types'
import { DEFAULT_NOTIFICATION } from './mail-notifications-constants'
import type {
  MailNotification,
  NotificationFormValues,
} from './mail-notifications-type'

export function createEmptyNotification(): MailNotification {
  return { ...DEFAULT_NOTIFICATION, addresses: [] }
}

export function mapApiNotificationToUi(
  api: ApiNotification | null
): MailNotification {
  if (!api) {
    return createEmptyNotification()
  }

  return {
    enabled: Boolean(api.enabled),
    addresses: api.notifyAddresses ?? [],
    message: api.notifyMessage ?? '',
  }
}

export function mapUiNotificationToApi(ui: MailNotification): ApiNotification {
  return {
    enabled: ui.enabled ? 1 : 0,
    notifyAddresses: ui.addresses,
    notifyMessage: ui.message,
  }
}

export function mapMailNotificationToFormValues(
  ui: MailNotification
): NotificationFormValues {
  return {
    enabled: ui.enabled,
    emails: ui.addresses.map((value) => ({ value })),
    email: '',
    message: ui.message,
  }
}

export function mapFormValuesToMailNotification(
  values: NotificationFormValues
): MailNotification {
  return {
    enabled: values.enabled,
    addresses: values.emails.map((item) => item.value),
    message: values.message,
  }
}
