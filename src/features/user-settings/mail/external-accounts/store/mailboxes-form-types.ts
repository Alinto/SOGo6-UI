import {
  AUTHMECH_LOGIN,
  AUTHMECH_PLAIN,
  RECEIPT_POLICY,
  SOCKET_ENC_EXPLICIT_TLS,
  SOCKET_ENC_IMPLICIT_TLS,
  SOCKET_ENC_PLAIN,
} from './mailboxes-api-types'

export interface Receipts {
  enabled: boolean
  not_to_cc?: RECEIPT_POLICY
  outside_domain?: RECEIPT_POLICY
  other?: RECEIPT_POLICY
}

export interface MailBoxIdentitySettings {
  mail: string
  name: string
  replyTo: string
  isDefault: boolean
  signatures: Record<string, string>
}

export interface MailServerSettings {
  server: string
  port: number
  encryption:
    | typeof SOCKET_ENC_PLAIN
    | typeof SOCKET_ENC_IMPLICIT_TLS
    | typeof SOCKET_ENC_EXPLICIT_TLS
  password: string
  username: string
  auth_mech: typeof AUTHMECH_PLAIN | typeof AUTHMECH_LOGIN
}

export interface MailboxSettings extends MailboxPOSTSettings {
  id: string
}

export interface MailboxPOSTSettings {
  name: string
  mail_server: MailServerSettings
  // certificates: object
  identities: MailBoxIdentitySettings[]
  receipts: Receipts
  mail_outgoing: MailServerSettings
}
