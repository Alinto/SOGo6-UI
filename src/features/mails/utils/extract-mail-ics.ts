import type { ImapMessages } from '@/features/mails/mails-types'

/** Returns the first non-empty ICS payload from a mail detail response. */
export function extractIcsFromMail(
  mail: ImapMessages | undefined
): string | null {
  if (!mail) return null

  const items = mail.mail_type_data ?? mail.mailTypeData ?? []
  for (const item of items) {
    const content = item.ics_content?.trim()
    if (content) return content
  }

  return null
}

/** Returns backend-provided event_key from mail_type_data when available. */
export function extractEventKeyFromMail(
  mail: ImapMessages | undefined
): string | null {
  if (!mail) return null

  const items = mail.mail_type_data ?? mail.mailTypeData ?? []
  for (const item of items) {
    const key = item.event_key?.trim()
    if (key) return key
  }

  return null
}

/** True when the mail is flagged as a calendar event message. */
export function mailHasEventType(mail: ImapMessages | undefined): boolean {
  if (!mail) return false
  const types = mail.mail_type ?? mail.mailType ?? []
  return types.includes('event')
}
