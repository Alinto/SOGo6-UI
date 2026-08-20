import type {
  ImapAttachments,
  ImapFolder,
  ImapMessages,
  ImapMessagesAPIResponse,
  ImapMessagesBackendResponse,
  ImapMessagesList,
  MailTypeDataItem,
} from '../mails-types'

/** Backend wraps every response in `{ data, error_code, error_msg }`. */
export interface BackendResponse<T> {
  data: T
  error_code: string
  error_msg: string
}

/** Shape of the `X-Pagination` response header (see server paginate_sort_filter). */
export interface PaginationHeader {
  total: number
  total_pages: number
  first_page: number
  last_page: number
  page: number
}

/** Folder payloads may still use legacy `unseen` instead of `unseen_count`. */
export type RawImapFolder = Omit<ImapFolder, 'unseen_count' | 'selectable'> & {
  unseen_count?: number
  unseen?: number
  selectable?: boolean
  subfolders?: RawImapFolder[]
  children?: RawImapFolder[]
}

/** Raw list message item as returned by the API (before normalization). */
export interface RawMailListItem {
  uid?: string
  id?: string
  subject?: string
  from?: { name: string; email: string }
  to?: Array<{ name: string; email: string }>
  date?: string
  seen?: boolean
  flagged?: boolean
  has_attachment?: boolean
  size?: number
  contents?: Array<{ content: string; contentType: string }>
  snippet?: string
  answered?: boolean
  forwarded?: boolean
  deleted?: boolean
  priority?: number
  mail_type?: string | string[]
  /** Already normalized (response `{ mails: ImapMessagesList[] }`). */
  mailType?: string[]
  flags?: string[]
}

export function normalizeImapFolder(folder: RawImapFolder): ImapFolder {
  const { unseen, subfolders, children, ...rest } = folder
  const unseen_count = folder.unseen_count ?? unseen ?? 0
  const selectable = folder.selectable ?? true
  return {
    ...rest,
    unseen_count,
    selectable,
    subfolders: subfolders?.map(normalizeImapFolder),
    children: children?.map(normalizeImapFolder),
  } as ImapFolder
}

export function normalizeImapFolderTree(
  folders: RawImapFolder[]
): ImapFolder[] {
  return folders.map(normalizeImapFolder)
}

export function normalizeListMailTypes(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.filter((v): v is string => typeof v === 'string')
  }
  if (typeof raw === 'string' && raw.length > 0) {
    return [raw]
  }
  return []
}

export function coerceListPriority(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 3
}

export function mapMailToListItem(mail: RawMailListItem): ImapMessagesList {
  const textContent =
    mail.contents?.find((c) => c.contentType === 'text/plain')?.content || ''
  const snippetFromContents = textContent
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .trim()
    .substring(0, 100)
  const apiSnippet = typeof mail.snippet === 'string' ? mail.snippet.trim() : ''
  const snippet = apiSnippet || snippetFromContents

  return {
    id: mail.uid || mail.id || '',
    subject: mail.subject || '(No subject)',
    from: mail.from || { name: '', email: '' },
    to: mail.to || [],
    date: mail.date || '',
    seen: mail.seen || false,
    flagged: mail.flagged || false,
    hasAttachment: mail.has_attachment || false,
    snippet,
    size: mail.size,
    answered: mail.answered ?? false,
    forwarded: mail.forwarded ?? false,
    deleted: mail.deleted ?? false,
    priority: coerceListPriority(mail.priority),
    mailType: normalizeListMailTypes(
      mail.mail_type !== undefined && mail.mail_type !== null
        ? mail.mail_type
        : mail.mailType
    ),
    flags: Array.isArray(mail.flags) ? mail.flags : [],
  }
}

/**
 * Extracts HTML or text content from contents[] for compatibility with MailContent
 * @param contents - Contents from the backend
 * @returns Content of the mail or empty string if unavailable
 */
function normalizeMailTypeData(raw: unknown): MailTypeDataItem[] {
  if (!Array.isArray(raw)) return []
  return raw.filter(
    (item): item is MailTypeDataItem =>
      typeof item === 'object' && item !== null
  )
}

/** Normalizes mail detail fields from API (snake_case + camelCase aliases). */
export function normalizeMailDetail(mail: ImapMessages): ImapMessages {
  const mailType = normalizeListMailTypes(
    mail.mail_type !== undefined && mail.mail_type !== null
      ? mail.mail_type
      : mail.mailType
  )
  const mailTypeData = normalizeMailTypeData(
    mail.mail_type_data !== undefined && mail.mail_type_data !== null
      ? mail.mail_type_data
      : mail.mailTypeData
  )

  return {
    ...mail,
    mail_type: mailType,
    mailType,
    mail_type_data: mailTypeData,
    mailTypeData,
  }
}

export function extractBodyFromContents(
  contents: Array<{ content: string; contentType: string }> | undefined
): string {
  if (!contents || contents.length === 0) return ''

  try {
    // Prioritize HTML
    const htmlContent = contents.find(
      (c) => c?.contentType === 'text/html' && typeof c?.content === 'string'
    )
    if (htmlContent?.content) return htmlContent.content

    // Fallback plain text
    const plainContent = contents.find(
      (c) => c?.contentType === 'text/plain' && typeof c?.content === 'string'
    )
    return plainContent?.content || ''
  } catch {
    return ''
  }
}

/**
 * Normalizes attachments from the backend to the ImapAttachments format
 * Backend : Array<{filename, contentType, size, extension}>
 * Frontend : ImapAttachments {parts: [...], count, zipUri?}
 * @param attachments - Raw attachments from the backend or already normalized
 * @returns Format ImapAttachments unifié
 */
export function normalizeAttachments(
  attachments:
    | ImapAttachments
    | Array<{
        filename: string
        contentType: string
        size: number
        extension: string
      }>
): ImapAttachments {
  // Strict type guard: verify it's already a valid ImapAttachments
  if (
    attachments &&
    typeof attachments === 'object' &&
    'count' in attachments &&
    typeof attachments.count === 'number'
  ) {
    return attachments as ImapAttachments
  }

  // Real backend: transform Array → ImapAttachments
  if (Array.isArray(attachments) && attachments.length > 0) {
    try {
      const parts = attachments.map((att, index) => ({
        partId: att.filename || `attachment-${index}`,
        name: att.filename || 'unnamed',
        contentType: att.contentType || 'application/octet-stream',
        size: att.size || 0,
      }))

      return {
        parts,
        count: parts.length,
        zipUri: undefined,
      }
    } catch {
      return { parts: [], count: 0 }
    }
  }

  // Fallback: no attachments or invalid format
  return { parts: [], count: 0 }
}

/**
 * Normalizes the folder-messages response into `ImapMessagesBackendResponse`.
 *
 * Handles the three known payload shapes (raw array, `{ messages }`, `{ mails }`),
 * optionally wrapped in `BackendResponse`, and derives pagination from the
 * `X-Pagination` header when present (falling back to the body otherwise).
 */
export function transformFolderMessagesResponse(
  response:
    | BackendResponse<RawMailListItem[]>
    | BackendResponse<ImapMessagesAPIResponse>
    | ImapMessagesAPIResponse,
  meta: { response?: Response }
): ImapMessagesBackendResponse {
  const paginationHeader = meta?.response?.headers?.get('X-Pagination')
  let total = 0
  let totalPages = 1
  let page = 1

  if (paginationHeader) {
    try {
      const pagination: PaginationHeader = JSON.parse(paginationHeader)
      total = pagination.total || 0
      totalPages = pagination.total_pages || 1
      page = pagination.page || 1
      totalPages = totalPages || 1
      total = total >= 0 ? total : 0
    } catch {
      // Invalid X-Pagination JSON: totals are derived from the response body when possible
    }
  }

  const payload =
    typeof response === 'object' && response && 'data' in response
      ? response.data
      : response

  let rawMails: RawMailListItem[] = []

  if (Array.isArray(payload)) {
    rawMails = payload as RawMailListItem[]
  } else if (
    payload &&
    typeof payload === 'object' &&
    'messages' in payload &&
    Array.isArray((payload as { messages: unknown }).messages)
  ) {
    const body = payload as ImapMessagesAPIResponse
    rawMails = body.messages as RawMailListItem[]
    if (!paginationHeader) {
      total = body.total ?? rawMails.length
      totalPages = body.totalPages ?? 1
      page = body.page ?? 1
    }
  } else if (
    payload &&
    typeof payload === 'object' &&
    'mails' in payload &&
    Array.isArray((payload as { mails: unknown }).mails)
  ) {
    const body = payload as ImapMessagesBackendResponse
    rawMails = body.mails as RawMailListItem[]
    if (!paginationHeader) {
      total = body.total ?? rawMails.length
      totalPages = body.totalPages ?? 1
      page = body.page ?? 1
    }
  }

  const mails = rawMails.map(mapMailToListItem)

  if (!paginationHeader) {
    total = total || mails.length
    totalPages = totalPages || 1
    page = page || 1
  }

  return {
    mails,
    total,
    page,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
}

/** Recomputes pagination flags after the item count of a page cache changed. */
export function recomputePagination(
  draft: ImapMessagesBackendResponse,
  pageSize: number
): void {
  const safePageSize = pageSize > 0 ? pageSize : 20
  draft.total = draft.total > 0 ? draft.total : 0
  draft.totalPages =
    draft.total > 0 ? Math.max(1, Math.ceil(draft.total / safePageSize)) : 0
  draft.hasNextPage = draft.page < draft.totalPages
  draft.hasPreviousPage = draft.page > 1
}
