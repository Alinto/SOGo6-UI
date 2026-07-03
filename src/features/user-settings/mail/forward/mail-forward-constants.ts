import type { MailForward } from './mail-forward-types'

export const MAX_FORWARD_ADDRESSES = 10

export const DEFAULT_FORWARD: MailForward = {
  enabled: false,
  addresses: [],
  alwaysSend: false,
  keepCopy: false,
}
