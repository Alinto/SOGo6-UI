import type { Identity } from '@/features/user-profile/profile-types'
import type { SendMailBody } from '../store/mail-api-types'
import type {
  MailComposeDraft,
  MailComposeRecipient,
} from '../store/mail-compose-slice'

export interface ComposeMailFields {
  selectedIdentity: Identity | null
  toRecipients: MailComposeRecipient[]
  ccRecipients: MailComposeRecipient[]
  bccRecipients: MailComposeRecipient[]
  subject: string
  body: string
  requestReadReceipt: boolean
  selectedPriority: MailComposeDraft['priority']
  isPlainText: boolean
}

export function buildComposeMailPayload({
  selectedIdentity,
  toRecipients,
  ccRecipients,
  bccRecipients,
  subject,
  body,
  requestReadReceipt,
  selectedPriority,
  isPlainText,
}: ComposeMailFields): SendMailBody {
  return {
    // `from` is only undefined for an instant while a draft's default
    // identity is being resolved; callers guard actual sends on it being set.
    from: selectedIdentity?.mail as string,
    to: toRecipients.map((r: MailComposeRecipient) => r.email),
    cc: ccRecipients.map((r: MailComposeRecipient) => r.email),
    bcc: bccRecipients.map((r: MailComposeRecipient) => r.email),
    subject,
    body,
    return_receipt: requestReadReceipt ? true : null,
    priority: selectedPriority,
    is_html: !isPlainText,
    reply_to: selectedIdentity?.replyTo || null,
  }
}
