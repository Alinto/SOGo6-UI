import type { MailSearchParams } from '../mails-types'
import type { MailListFilter } from './client-mail-list-filter'

const QUICK_FILTER_CRITERIA: Record<MailListFilter, MailSearchParams> = {
  read: { is_read: true },
  unread: { is_read: false },
  flagged: { is_flagged: true },
  attachments: { has_attachment: true },
}

/**
 * The folder list route has no quick filter, so a filtered list is a search
 * restricted to the current folder (subfolders excluded).
 */
export function toQuickFilterSearchBody(
  filter: MailListFilter,
  folder: string
): MailSearchParams {
  return {
    ...QUICK_FILTER_CRITERIA[filter],
    folders: [folder],
    include_subfolders: false,
  }
}

/**
 * Query params of the filtered search: same page, page size, sort and light
 * fields as the folder list. Without a chosen sort the folder list shows the
 * newest mails first, while the search defaults to oldest first, so the date
 * order is sent explicitly.
 */
export function toQuickFilterSearchParams(
  listParams: Record<string, string>,
  page: number
): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page,
    sort_by: listParams.sort_by ?? 'date',
    sort_order: listParams.sort_order ?? 'desc',
  }
  for (const key of ['page_size', 'fields', 'fields_action']) {
    if (listParams[key] !== undefined) params[key] = listParams[key]
  }
  return params
}
