import type { ImapMessagesList } from '@/features/mails/mails-types'

/** Quick filters of the mail list, as sent in the API `filter` param. */
export const MAIL_LIST_FILTERS = [
  'read',
  'unread',
  'flagged',
  'attachments',
] as const

export type MailListFilter = (typeof MAIL_LIST_FILTERS)[number]

/** URL `filter=` value → API `filter` param (`undefined` for "all" or unknown values). */
export function toMailListApiFilter(
  value: string | null | undefined
): MailListFilter | undefined {
  return MAIL_LIST_FILTERS.find((filter) => filter === value)
}

/**
 * Filters mails already loaded on the client (offline cache, search results),
 * where the server cannot apply the URL `filter=`.
 */
export function getClientFilteredMails(
  mails: ImapMessagesList[],
  activeFilter: string
): ImapMessagesList[] {
  switch (activeFilter) {
    case 'unread':
      return mails.filter((m) => !m.seen)
    case 'read':
      return mails.filter((m) => m.seen)
    case 'flagged':
      return mails.filter((m) => m.flagged)
    case 'attachments':
      return mails.filter((m) => m.hasAttachment)
    default:
      return mails
  }
}
