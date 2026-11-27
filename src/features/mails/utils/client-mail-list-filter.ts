import type { ImapMessagesList } from '@/features/mails/mails-types'

/** Quick filters of the mail list, as sent in the API `filter` param. */
export const MAIL_LIST_FILTERS = [
  'read',
  'unread',
  'flagged',
  'attachments',
] as const

export type MailListFilter = (typeof MAIL_LIST_FILTERS)[number]

/** URL param of the label quick filter, repeated once per label. */
export const MAIL_LIST_LABEL_PARAM = 'label'

/** URL `filter=` value → API `filter` param (`undefined` for "all" or unknown values). */
export function toMailListApiFilter(
  value: string | null | undefined
): MailListFilter | undefined {
  return MAIL_LIST_FILTERS.find((filter) => filter === value)
}

/**
 * Labels of the label quick filter (`?label=A&label=B`), trimmed and deduped
 * case-insensitively (IMAP keywords are), the first spelling kept.
 */
export function getMailListLabels(searchParams: {
  getAll: (key: string) => string[]
}): string[] {
  const labels: string[] = []
  const seen = new Set<string>()
  for (const raw of searchParams.getAll(MAIL_LIST_LABEL_PARAM)) {
    const label = raw.trim()
    const key = label.toLowerCase()
    if (!label || seen.has(key)) continue
    seen.add(key)
    labels.push(label)
  }
  return labels
}

/** Whether the mail carries every one of the labels (case-insensitive). */
function hasAllLabels(mail: ImapMessagesList, labels: string[]): boolean {
  const flags = new Set((mail.flags ?? []).map((flag) => flag.toLowerCase()))
  return labels.every((label) => flags.has(label.toLowerCase()))
}

/**
 * Filters mails already loaded on the client (offline cache, search results),
 * where the server cannot apply the URL `filter=` and `label=`. Like the
 * server, it is `match:all`: the status filter and every given label.
 */
export function getClientFilteredMails(
  mails: ImapMessagesList[],
  activeFilter: string,
  labels: string[] = []
): ImapMessagesList[] {
  const byLabel =
    labels.length > 0 ? mails.filter((m) => hasAllLabels(m, labels)) : mails
  switch (activeFilter) {
    case 'unread':
      return byLabel.filter((m) => !m.seen)
    case 'read':
      return byLabel.filter((m) => m.seen)
    case 'flagged':
      return byLabel.filter((m) => m.flagged)
    case 'attachments':
      return byLabel.filter((m) => m.hasAttachment)
    default:
      return byLabel
  }
}
