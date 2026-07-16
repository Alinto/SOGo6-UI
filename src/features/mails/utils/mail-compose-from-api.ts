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

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function formatContactForForward(contact?: {
  name?: string
  email?: string
}): string {
  if (!contact?.email) return ''
  const safeEmail = escapeHtml(contact.email)
  return contact.name
    ? `${escapeHtml(contact.name)} &lt;${safeEmail}&gt;`
    : safeEmail
}

function formatDateForForward(date: number | string): string {
  return new Date(date).toLocaleString('fr-FR', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateForReply(date: number | string): string {
  const parsedDate = new Date(date)
  const datePart = parsedDate.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const timePart = parsedDate.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  return `${datePart} at ${timePart}`
}

export function buildForwardedBody(
  mail: Pick<ImapMessages, 'from' | 'to' | 'date' | 'subject'>,
  body: string
): string {
  const header = [
    '<div>---------- Forwarded message ---------</div>',
    `<div>From: ${formatContactForForward(mail.from)}</div>`,
    `<div>Date: ${escapeHtml(formatDateForForward(mail.date))}</div>`,
    `<div>Subject: ${escapeHtml(mail.subject ?? '')}</div>`,
    `<div>To: ${(mail.to ?? []).map(formatContactForForward).filter(Boolean).join(', ')}</div>`,
    '<br />',
  ].join('')

  return header + body
}

export function buildQuotedReplyBody(
  mail: Pick<ImapMessages, 'from' | 'date'>,
  body: string
): string {
  const header = `<div>On ${escapeHtml(formatDateForReply(mail.date))}, ${formatContactForForward(mail.from)} wrote:</div>`
  const quoted = `<blockquote style="margin:0 0 0 .8ex;border-left:1px solid #ccc;padding-left:1ex;">${body}</blockquote>`

  return header + quoted
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
    isPlainText: false,
    isDirty: false,
    createdAt: now,
    updatedAt: now,
    selectedSignatureKey: null,
  }
}
