import type {
  ApiNotification,
  ApiNotificationLegacy,
} from './mail-notifications-api-types'
import { DEFAULT_NOTIFICATION } from './mail-notifications-constants'
import type {
  MailNotification,
  NotificationFormValues,
} from './mail-notifications-type'

type ApiNotificationInput = ApiNotification | ApiNotificationLegacy | null

function toBoolean(value: boolean | 0 | 1 | undefined): boolean {
  return Boolean(value)
}

function normalizeApiNotification(
  api: ApiNotificationInput
): ApiNotification | null {
  if (!api) return null

  const legacy = api as ApiNotificationLegacy
  const snake = api as ApiNotification

  return {
    enabled: toBoolean(snake.enabled ?? legacy.enabled),
    notify_addresses: snake.notify_addresses ?? legacy.notifyAddresses ?? [],
    notify_message: snake.notify_message ?? legacy.notifyMessage ?? '',
  }
}

export function createEmptyNotification(): MailNotification {
  return { ...DEFAULT_NOTIFICATION, addresses: [] }
}

export function mapApiNotificationToUi(
  api: ApiNotificationInput
): MailNotification {
  const normalized = normalizeApiNotification(api)
  if (!normalized) {
    return createEmptyNotification()
  }

  return {
    enabled: normalized.enabled,
    addresses: normalized.notify_addresses ?? [],
    message: normalized.notify_message ?? '',
  }
}

export function mapUiNotificationToApi(ui: MailNotification): ApiNotification {
  return {
    enabled: ui.enabled,
    notify_addresses: ui.addresses,
    notify_message: ui.message,
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
