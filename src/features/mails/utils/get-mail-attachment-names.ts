import type { ImapMessages } from '@/features/mails/mails-types'

export function getMailAttachmentNames(
  attachments: ImapMessages['attachments'] | undefined
): string[] {
  if (!attachments) return []

  if (Array.isArray(attachments)) {
    return attachments
      .map((part) => part.filename?.trim())
      .filter((name): name is string => Boolean(name))
  }

  if (!attachments.parts?.length) return []

  return attachments.parts
    .map((part) => part.name?.trim())
    .filter((name): name is string => Boolean(name))
}
