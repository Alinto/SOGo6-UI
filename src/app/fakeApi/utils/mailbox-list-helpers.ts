import type {
  ImapMessagesList,
  MailSearchParams,
} from '@/features/mails/mails-types'

import { mailDetailByFolderSeed } from '@/app/fakeApi/utils/mailbox-mail-detail-seed'
import { messagesByFolderSeed } from '@/app/fakeApi/utils/mailbox-messages-seed'

const listDefaults: Pick<
  ImapMessagesList,
  'answered' | 'forwarded' | 'deleted' | 'priority' | 'mailType'
> = {
  answered: false,
  forwarded: false,
  deleted: false,
  priority: 3,
  mailType: [],
}

/** Champs attendus par `mapMailToListItem` / RawMailListItem côté mails-api. */
export type RawMailListItemSeed = {
  id?: string
  uid?: string
  subject?: string
  from?: { name: string; email: string }
  to?: Array<{ name: string; email: string }>
  date?: string
  seen?: boolean
  flagged?: boolean
  has_attachment?: boolean
  snippet?: string
  answered?: boolean
  forwarded?: boolean
  deleted?: boolean
  priority?: number
  mail_type?: string | string[]
  mailType?: string[]
  hasAttachment?: boolean
  flags?: string[]
  folder?: string
}

function toRawMailListItem(m: Partial<ImapMessagesList>): RawMailListItemSeed {
  const hasAttachment = m.hasAttachment === true
  return {
    id: m.id,
    subject: m.subject,
    from: m.from,
    to: m.to,
    date: m.date,
    seen: m.seen,
    flagged: m.flagged,
    has_attachment: hasAttachment,
    snippet: m.snippet,
    answered: m.answered,
    forwarded: m.forwarded,
    deleted: m.deleted,
    priority: m.priority,
    mailType: m.mailType,
    flags: m.flags,
    folder: m.folder,
  }
}

function parseListItemDate(m: ImapMessagesList): number {
  const d = m.date
  if (typeof d === 'number' && Number.isFinite(d)) return d
  const t = Date.parse(String(d))
  return Number.isFinite(t) ? t : 0
}

function firstRecipientEmail(m: ImapMessagesList): string {
  const first = m.to?.[0]
  if (!first) return ''
  return (first.email || '').toLowerCase()
}

/**
 * Tri côté fakeApi (même paramètres que le backend listé dans mails-api).
 * Défaut : date décroissante.
 */
function sortFolderMessages(
  messages: ImapMessagesList[],
  sortBy: string | null,
  sortOrder: string | null
): ImapMessagesList[] {
  const orderMul = sortOrder === 'asc' ? 1 : -1
  const by = sortBy || 'date'
  const out = [...messages]
  out.sort((a, b) => {
    let cmp = 0
    switch (by) {
      case 'from':
        cmp = (a.from?.email || '')
          .toLowerCase()
          .localeCompare((b.from?.email || '').toLowerCase())
        break
      case 'to':
        cmp = firstRecipientEmail(a).localeCompare(firstRecipientEmail(b))
        break
      case 'subject':
        cmp = (a.subject || '').localeCompare(b.subject || '', undefined, {
          sensitivity: 'base',
        })
        break
      case 'size':
        cmp = (a.size ?? 0) - (b.size ?? 0)
        break
      case 'cc':
        cmp = (a.subject || '').localeCompare(b.subject || '')
        break
      case 'date':
      default:
        cmp = parseListItemDate(a) - parseListItemDate(b)
        break
    }
    return cmp * orderMul
  })
  return out
}

export function buildFolderMessagesListResponse(
  folder: string,
  searchParams: URLSearchParams
): {
  mails: RawMailListItemSeed[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
} {
  const filter = searchParams.get('filter') || undefined
  const sortBy = searchParams.get('sort_by')
  const sortOrder = searchParams.get('sort_order')
  const pageParam = searchParams.get('page')
  const pageSizeParam = searchParams.get('page_size')
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1
  const pageSize = pageSizeParam
    ? Math.max(1, Math.min(100, parseInt(pageSizeParam, 10) || 20))
    : 30

  let messages: ImapMessagesList[] = (messagesByFolderSeed[folder] || []).map(
    (m) =>
      ({
        ...listDefaults,
        ...m,
      }) as ImapMessagesList
  )

  messages = sortFolderMessages(messages, sortBy, sortOrder)

  switch (filter) {
    case 'starred':
      messages = messages.filter((msg) => msg.flagged)
      break
    case 'attachments':
      messages = messages.filter((msg) => msg.hasAttachment)
      break
    case 'read':
      messages = messages.filter((msg) => msg.seen)
      break
    case 'unread':
      messages = messages.filter((msg) => !msg.seen)
      break
    default:
      break
  }

  const total = messages.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = messages.slice(start, start + pageSize)

  return {
    mails: paged.map(toRawMailListItem),
    total,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  }
}

function matchesText(value: string | undefined, needle: string): boolean {
  return (value || '').toLowerCase().includes(needle.toLowerCase())
}

/**
 * Mirrors `buildMailSearchParams`'s criteria semantics: subject/from/to/bcc/
 * text are combined with `operator` (default AND); everything else below is
 * a plain AND filter on top, regardless of `operator`.
 */
function messageMatchesCriteria(
  message: ImapMessagesList,
  params: MailSearchParams
): boolean {
  const checks: boolean[] = []
  if (params.subject) checks.push(matchesText(message.subject, params.subject))
  if (params.from) {
    checks.push(
      matchesText(message.from?.email, params.from) ||
        matchesText(message.from?.name, params.from)
    )
  }
  if (params.to) {
    checks.push(
      (message.to || []).some(
        (r) =>
          matchesText(r.email, params.to!) || matchesText(r.name, params.to!)
      )
    )
  }
  // bcc isn't modeled on the fake seed data, so it never matches.
  if (params.bcc) checks.push(false)
  if (params.text) {
    checks.push(
      matchesText(message.subject, params.text) ||
        matchesText(message.snippet, params.text)
    )
  }

  if (checks.length === 0) return true
  return params.operator === 'OR' ? checks.some(Boolean) : checks.every(Boolean)
}

/** Extensions of the message's attachments, resolved from the detail seed (list items only carry `hasAttachment`). */
function messageAttachmentExtensions(message: ImapMessagesList): string[] {
  if (!message.folder) return []
  const detail = (mailDetailByFolderSeed[message.folder] || []).find(
    (m) => m.id === message.id
  )
  const attachments = detail?.attachments
  if (!Array.isArray(attachments)) return []
  return attachments
    .map((a) => a.extension)
    .filter((ext): ext is string => Boolean(ext))
}

function messageMatchesFilters(
  message: ImapMessagesList,
  params: MailSearchParams
): boolean {
  if (params.has_attachment && !message.hasAttachment) return false
  if (params.attachment_type && params.attachment_type.length > 0) {
    const extensions = messageAttachmentExtensions(message)
    if (!params.attachment_type.some((type) => extensions.includes(type))) {
      return false
    }
  }
  if (params.is_read !== undefined && message.seen !== params.is_read) {
    return false
  }
  if (params.is_flagged && !message.flagged) return false
  if (params.labels && params.labels.length > 0) {
    const flags = message.flags || []
    if (!params.labels.every((label) => flags.includes(label))) return false
  }
  const { start, end } = params.date_range || {}
  if (start || end) {
    const time = parseListItemDate(message)
    if (start && time < Date.parse(start)) return false
    if (end && time > Date.parse(end) + 24 * 60 * 60 * 1000 - 1) return false
  }
  return true
}

function foldersToSearch(params: MailSearchParams): string[] {
  const allFolders = Object.keys(messagesByFolderSeed)
  const requested = (params.folders || []).filter((f) => f && f !== 'all')
  if (requested.length === 0) return allFolders
  if (!params.include_subfolders) {
    return allFolders.filter((f) => requested.includes(f))
  }
  return allFolders.filter((f) =>
    requested.some((r) => f === r || f.startsWith(`${r}/`))
  )
}

export function buildMailSearchResponse(
  body: MailSearchParams,
  searchParams: URLSearchParams
): {
  mails: RawMailListItemSeed[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
} {
  const pageParam = searchParams.get('page')
  const pageSizeParam = searchParams.get('page_size')
  const page = pageParam ? Math.max(1, parseInt(pageParam, 10) || 1) : 1
  const pageSize = pageSizeParam
    ? Math.max(1, Math.min(100, parseInt(pageSizeParam, 10) || 20))
    : 20

  const folders = foldersToSearch(body)
  let messages: ImapMessagesList[] = folders.flatMap((folder) =>
    (messagesByFolderSeed[folder] || []).map(
      (m) => ({ ...listDefaults, ...m, folder }) as ImapMessagesList
    )
  )

  messages = messages.filter(
    (m) => messageMatchesCriteria(m, body) && messageMatchesFilters(m, body)
  )
  messages = sortFolderMessages(messages, 'date', 'desc')

  const total = messages.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize
  const paged = messages.slice(start, start + pageSize)

  return {
    mails: paged.map(toRawMailListItem),
    total,
    page: safePage,
    pageSize,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  }
}
