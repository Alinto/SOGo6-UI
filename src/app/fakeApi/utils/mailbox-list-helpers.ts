import { NextRequest } from 'next/server'

import type { ImapMessagesList } from '@/features/mails/mails-types'

import { getDemoData } from '@/app/fakeApi/utils/demo-storage'
import {
  buildMailFlagsKey,
  MAIL_FLAGS_COOKIE,
  MailFlagsOverrides,
} from '@/app/fakeApi/utils/mailbox-flags-store'
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

  let messages: ImapMessagesList[] = (messagesByFolderSeed[folder] || []).map(
    (m) => {
      const overriddenFlags = m.id
        ? flagsOverrides[buildMailFlagsKey(folder, m.id)]
        : undefined
      return {
        ...listDefaults,
        ...m,
        ...(overriddenFlags
          ? {
              flags: overriddenFlags,
              flagged: overriddenFlags.includes('\\Flagged'),
              seen: overriddenFlags.includes('\\Seen'),
            }
          : {}),
      } as ImapMessagesList
    }
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
