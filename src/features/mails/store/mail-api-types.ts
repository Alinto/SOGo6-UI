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
  mailKey?: string | null
}

export interface SaveDraftArg {
  accountId: string // The mailbox account ID — derived from the selected identity's account
  mailKey: string | null // The mail key, if updating an existing draft. Null when creating a new draft.
  mail: SendMailBody
  close?: boolean // Whether to close the compose window after saving
  displayNotificationOnSuccess?: boolean
  displayNotificationOnError?: boolean
}

export interface UploadAttachmentArg {
  accountId: string
  mailKey: string | null
  file: File
}

export interface DeleteAttachmentArg {
  accountId: string
  mailKey: string
  filename: string
}

export interface DownloadAttachmentArg {
  accountId: string
  mailKey: string
  filename: string
}

export interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

export interface CurrentMailItem {
  key: string
  locked: boolean
  mail_server_uid: string
}

export interface GetCurrentMailArg {
  accountId: string
}
