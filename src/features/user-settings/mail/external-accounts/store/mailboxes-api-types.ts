export const SOCKET_ENC_PLAIN = 'None'
export const SOCKET_ENC_IMPLICIT_TLS = 'SSL/TLS'
export const SOCKET_ENC_EXPLICIT_TLS = 'StartTLS'

export const IMAP = 'imap'

export const SMTP = 'smtp'

export const AUTHMECH_PLAIN = 'plain'
export const AUTHMECH_LOGIN = 'login'

export const RECEIPT_POLICY_NEVER = 'never' as const
export const RECEIPT_POLICY_ALWAYS = 'always' as const
export const RECEIPT_POLICY_ASK = 'ask' as const

export type RECEIPT_POLICY =
  | typeof RECEIPT_POLICY_ALWAYS
  | typeof RECEIPT_POLICY_NEVER
  | typeof RECEIPT_POLICY_ASK

export interface Receipts {
  enabled: boolean
  not_to_cc: RECEIPT_POLICY
  outside_domain: RECEIPT_POLICY
  other: RECEIPT_POLICY
}

export interface MailBoxIdentity {
  mail: string
  name: string
  replyTo: string
  isDefault: boolean
  signatures: Record<string, string>
}

export interface MailServerSchema extends MailServer {
  type: typeof IMAP
}

export interface MailOutgoing extends MailServer {
  type: typeof SMTP
}

export interface MailServer {
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

export interface Mailbox extends MailboxPOST {
  id: string
}

export interface MailboxPOST {
  name: string
  mail_server: MailServerSchema
  // certificates: any
  identities?: MailBoxIdentity[]
  mail_outgoing: MailOutgoing
  receipts: Receipts
}

export interface MailboxesResponse {
  data: Mailbox[]
  error_code: string
  error_msg: string
}
