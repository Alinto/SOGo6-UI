// ── Types ──────────────────────────────────────────────────────────────────

export interface SendMailAttachment {
  filename: string
  contentType: string
  /** Base64-encoded content */
  content: string
}

export interface SendMailBody {
  from: string
  to: string[]
  subject: string
  body: string
  cc?: string[]
  bcc?: string[]
  /** null = no receipt requested */
  return_receipt?: boolean | null
  attachments?: SendMailAttachment[]
}

export interface SendMailArg {
  /** The mailbox account ID — derived from the selected identity's account */
  accountId: string
  mail: SendMailBody
  mailUid?: string | null
}

export interface SaveDraftArg {
  /** The mailbox account ID — derived from the selected identity's account */
  accountId: string
  mailUid: string | null
  mail: SendMailBody
  displayNotification: boolean
}

export interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}
