import type { ImapMessagesList } from '@/features/mails/mails-types'

/** Filtre client (URL `filter=`) sur une page déjà paginée côté serveur. */
export function getClientFilteredMails(
  mails: ImapMessagesList[],
  activeFilter: string
): ImapMessagesList[] {
  switch (activeFilter) {
    case 'unread':
      return mails.filter((m) => !m.seen)
    case 'read':
      return mails.filter((m) => m.seen)
    case 'starred':
      return mails.filter((m) => m.flagged)
    case 'attachments':
      return mails.filter((m) => m.hasAttachment)
    default:
      return mails
  }
}
