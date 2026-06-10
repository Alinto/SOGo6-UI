import type { ImapAttachmentPart, ImapMessages } from '../mails-types'
import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_HIGHEST,
  MAIL_PRIORITY_LOW,
  MAIL_PRIORITY_LOWEST,
  MAIL_PRIORITY_NORMAL,
  type MailComposeAttachment,
  type MailComposeDraft,
  type MailComposeRecipient,
} from '../store/mail-compose-slice'

type RawApiAttachment = {
  filename: string
  contentType: string
  size: number
  downloadUri: string
  displayUri: string
  extension: string
}

export type ApiMailData = Partial<ImapMessages> & {
  key?: string
}

function coercePriority(value: unknown): MailComposeDraft['priority'] {
  switch (value) {
    case 0:
      return MAIL_PRIORITY_LOWEST
    case 1:
      return MAIL_PRIORITY_LOW
    case 3:
      return MAIL_PRIORITY_HIGH
    case 4:
      return MAIL_PRIORITY_HIGHEST
    default:
      return MAIL_PRIORITY_NORMAL
  }
}

function filterRecipients(
  recipients: Array<{ name?: string; email: string }> | undefined
): MailComposeRecipient[] {
  if (!recipients) return []
  return recipients
    .filter((r) => r.email.trim() !== '')
    .map((r) => ({ email: r.email, ...(r.name ? { name: r.name } : {}) }))
}

function mapAttachments(
  draftId: string,
  attachments: ImapMessages['attachments'] | undefined
): MailComposeAttachment[] {
  if (!attachments) return []

  if (Array.isArray(attachments)) {
    return (attachments as RawApiAttachment[]).map((att) => ({
      draftId: draftId,
      name: att.filename || 'unnamed',
      size: att.size || 0,
      type: att.contentType || 'application/octet-stream',
      uploadStatus: 'completed' as const,
      uploadProgress: 100,
    }))
  }

  return (attachments.parts ?? []).map((part: ImapAttachmentPart) => ({
    draftId: draftId,
    name: part.name || 'unnamed',
    size: part.size || 0,
    type: part.contentType || 'application/octet-stream',
    uploadStatus: 'completed' as const,
    uploadProgress: 100,
  }))
}

function extractBody(data: Pick<ImapMessages, 'body' | 'contents'>): string {
  if (data.body) return data.body
  if (!data.contents?.length) return ''
  const html = data.contents.find((c) => c.contentType === 'text/html')
  if (html?.content) return html.content
  const plain = data.contents.find((c) => c.contentType === 'text/plain')
  return plain?.content ?? ''
}

export function apiDataToMailComposeDraft(
  draftId: string,
  data: ApiMailData
): MailComposeDraft {
  const now = Date.now()
  return {
    draftId: draftId,
    mailKey: data.key ?? null,
    to: filterRecipients(data.to),
    cc: filterRecipients(data.cc),
    bcc: filterRecipients(data.bcc),
    subject: data.subject ?? '',
    body: extractBody(data),
    attachments: mapAttachments(draftId, data.attachments),
    priority: coercePriority(data.priority),
    requestReadReceipt: data.should_ask_receipt ?? false,
    isDirty: false,
    createdAt: now,
    updatedAt: now,
    selectedSignatureKey: null,
  }
}
