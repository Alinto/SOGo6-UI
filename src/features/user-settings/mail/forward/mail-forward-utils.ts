import type { ApiForward } from './mail-forward-api-types'
import { DEFAULT_FORWARD } from './mail-forward-constants'
import type { ForwardFormValues, MailForward } from './mail-forward-types'

export function createEmptyForward(): MailForward {
  return { ...DEFAULT_FORWARD, addresses: [] }
}

export function mapApiForwardToUi(api: ApiForward | null): MailForward {
  if (!api) {
    return createEmptyForward()
  }

  return {
    enabled: Boolean(api.enabled),
    addresses: api.forwardAddress ?? [],
    alwaysSend: Boolean(api.alwaysSend),
    keepCopy: Boolean(api.keepCopy),
  }
}

export function mapUiForwardToApi(ui: MailForward): ApiForward {
  return {
    enabled: ui.enabled ? 1 : 0,
    forwardAddress: ui.addresses,
    keepCopy: ui.keepCopy ? 1 : 0,
    alwaysSend: ui.alwaysSend ? 1 : 0,
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
