import { NextRequest } from 'next/server'

import type {
  ImapMessages,
  ImapMessagesList,
  MailSearchParams,
  MailSearchSize,
} from '@/features/mails/mails-types'

import { getDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  buildMailFlagsKey,
  MAIL_FLAGS_COOKIE,
  MailFlagsOverrides,
} from '@/app/fakeApi/utils/mailbox-flags-store'
import { mailDetailByFolderSeed } from '@/app/fakeApi/utils/mailbox-mail-detail-seed'
import { messagesByFolderSeed } from '@/app/fakeApi/utils/mailbox-messages-seed'
import {
  MAIL_MOVES_COOKIE,
  MailMoveOverrides,
} from '@/app/fakeApi/utils/mailbox-move-store'

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

/**
 * Resolves the seed messages that belong to `folder`, applying demo mail
 * moves: messages moved out of `folder` are dropped, and messages moved into
 * `folder` from elsewhere (e.g. report as phishing/illegal → Junk) are added.
 */
function resolveFolderMessages(
  folder: string,
  moveOverrides: MailMoveOverrides
): Partial<ImapMessagesList>[] {
  const own = (messagesByFolderSeed[folder] || []).filter(
    (m) => !m.id || (moveOverrides[m.id] ?? folder) === folder
  )
  const movedIn = Object.entries(messagesByFolderSeed)
    .filter(([sourceFolder]) => sourceFolder !== folder)
    .flatMap(([, messages]) => messages)
    .filter((m) => m.id && moveOverrides[m.id] === folder)
  return [...own, ...movedIn]
}

/** Seed messages of `folder` with demo moves and flag overrides applied. */
function loadFolderMessages(
  folder: string,
  flagsOverrides: MailFlagsOverrides,
  moveOverrides: MailMoveOverrides
): ImapMessagesList[] {
  return resolveFolderMessages(folder, moveOverrides).map((m) => {
    const overriddenFlags = m.id
      ? flagsOverrides[buildMailFlagsKey(folder, m.id)]
      : undefined
    return {
      ...listDefaults,
      ...m,
      folder,
      ...(overriddenFlags
        ? {
            flags: overriddenFlags,
            flagged: overriddenFlags.includes('\\Flagged'),
            seen: overriddenFlags.includes('\\Seen'),
          }
        : {}),
    } as ImapMessagesList
  })
}

export function buildFolderMessagesListResponse(
  folder: string,
  searchParams: URLSearchParams,
  req?: NextRequest
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

  const flagsOverrides = req
    ? getDemoData<MailFlagsOverrides>(req, MAIL_FLAGS_COOKIE, {})
    : {}
  const moveOverrides = req
    ? getDemoData<MailMoveOverrides>(req, MAIL_MOVES_COOKIE, {})
    : {}

  let messages = loadFolderMessages(folder, flagsOverrides, moveOverrides)

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

/** Detail seed entry of a list message (list items lack cc/bcc/body/attachments). */
function findMessageDetail(
  message: ImapMessagesList
): ImapMessages | undefined {
  if (!message.folder) return undefined
  return (mailDetailByFolderSeed[message.folder] || []).find(
    (m) => m.id === message.id
  )
}

/**
 * Detail seed addresses are raw `"Name <email>"` strings despite the
 * `{ name, email }` type — accept both shapes.
 */
function addressText(address: unknown): string {
  if (typeof address === 'string') return address
  if (address && typeof address === 'object') {
    const { name, email } = address as { name?: string; email?: string }
    return `${name ?? ''} <${email ?? ''}>`
  }
  return ''
}

function anyAddressMatches(addresses: unknown[], needles: string[]): boolean {
  return addresses.some((address) =>
    needles.some((needle) => matchesText(addressText(address), needle))
  )
}

function stripHtml(html: string | undefined): string {
  return (html || '').replace(/<[^>]+>/g, ' ')
}

/**
 * Mirrors `buildMailSearchParams`'s criteria semantics: subject/from/to/bcc/
 * text are combined with `operator` (default AND); everything else below is
 * a plain AND filter on top, regardless of `operator`. Within one address
 * field, any of its values may match.
 */
function messageMatchesCriteria(
  message: ImapMessagesList,
  params: MailSearchParams
): boolean {
  const detail = findMessageDetail(message)
  const checks: boolean[] = []
  if (params.subject) checks.push(matchesText(message.subject, params.subject))
  if (params.from && params.from.length > 0) {
    checks.push(anyAddressMatches([message.from], params.from))
  }
  if (params.to && params.to.length > 0) {
    checks.push(
      anyAddressMatches(
        [...(message.to || []), ...(detail?.cc || [])],
        params.to
      )
    )
  }
  if (params.bcc && params.bcc.length > 0) {
    checks.push(anyAddressMatches(detail?.bcc || [], params.bcc))
  }
  if (params.text) {
    const text = params.text
    checks.push(
      matchesText(message.subject, text) ||
        matchesText(message.snippet, text) ||
        matchesText(stripHtml(detail?.body), text) ||
        anyAddressMatches(
          [message.from, ...(message.to || []), ...(detail?.cc || [])],
          [text]
        )
    )
  }

  if (checks.length === 0) return true
  return params.operator === 'OR' ? checks.some(Boolean) : checks.every(Boolean)
}

/** Extensions of the message's attachments, resolved from the detail seed (list items only carry `hasAttachment`). */
function messageAttachmentExtensions(message: ImapMessagesList): string[] {
  const attachments = findMessageDetail(message)?.attachments
  if (!Array.isArray(attachments)) return []
  return attachments
    .map((a) => a.extension)
    .filter((ext): ext is string => Boolean(ext))
}

const SIZE_UNIT_BYTES: Record<MailSearchSize['unit'], number> = {
  kb: 1024,
  mb: 1024 ** 2,
  gb: 1024 ** 3,
}

/** Same semantics as the IMAP LARGER/SMALLER search keys. */
function messageMatchesSize(
  message: ImapMessagesList,
  size: MailSearchSize
): boolean {
  const limit = size.value * SIZE_UNIT_BYTES[size.unit]
  const messageSize = message.size ?? 0
  return size.operator === '>' ? messageSize > limit : messageSize < limit
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
  if (params.size && !messageMatchesSize(message, params.size)) return false
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
  searchParams: URLSearchParams,
  req?: NextRequest
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

  const flagsOverrides = req
    ? getDemoData<MailFlagsOverrides>(req, MAIL_FLAGS_COOKIE, {})
    : {}
  const moveOverrides = req
    ? getDemoData<MailMoveOverrides>(req, MAIL_MOVES_COOKIE, {})
    : {}

  const folders = foldersToSearch(body)
  let messages = folders.flatMap((folder) =>
    loadFolderMessages(folder, flagsOverrides, moveOverrides)
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
