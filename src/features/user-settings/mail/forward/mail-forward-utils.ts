import type {
  ApiForward,
  ApiForwardLegacy,
} from './mail-forward-api-types'
import { DEFAULT_FORWARD } from './mail-forward-constants'
import type { ForwardFormValues, MailForward } from './mail-forward-types'

type ApiForwardInput = ApiForward | ApiForwardLegacy | null

function toBoolean(value: boolean | 0 | 1 | undefined): boolean {
  return Boolean(value)
}

function normalizeApiForward(api: ApiForwardInput): ApiForward | null {
  if (!api) return null

  const legacy = api as ApiForwardLegacy
  const snake = api as ApiForward

  return {
    enabled: toBoolean(snake.enabled ?? legacy.enabled),
    forward_address: snake.forward_address ?? legacy.forwardAddress ?? [],
    keep_copy: toBoolean(snake.keep_copy ?? legacy.keepCopy),
    always_send: toBoolean(snake.always_send ?? legacy.alwaysSend),
  }
}

export function createEmptyForward(): MailForward {
  return { ...DEFAULT_FORWARD, addresses: [] }
}

export function mapApiForwardToUi(api: ApiForwardInput): MailForward {
  const normalized = normalizeApiForward(api)
  if (!normalized) {
    return createEmptyForward()
  }

  return {
    enabled: normalized.enabled,
    addresses: normalized.forward_address ?? [],
    alwaysSend: normalized.always_send,
    keepCopy: normalized.keep_copy,
  }
}

export function mapUiForwardToApi(ui: MailForward): ApiForward {
  return {
    enabled: ui.enabled,
    forward_address: ui.addresses,
    keep_copy: ui.keepCopy,
    always_send: ui.alwaysSend,
  }
}

export function mapMailForwardToFormValues(ui: MailForward): ForwardFormValues {
  return {
    enabled: ui.enabled,
    emails: ui.addresses.map((value) => ({ value })),
    email: '',
    alwaysSend: ui.alwaysSend,
    keepCopy: ui.keepCopy,
  }
}

export function mapFormValuesToMailForward(values: ForwardFormValues): MailForward {
  return {
    enabled: values.enabled,
    addresses: values.emails.map((item) => item.value),
    alwaysSend: values.alwaysSend,
    keepCopy: values.keepCopy,
  }
}
