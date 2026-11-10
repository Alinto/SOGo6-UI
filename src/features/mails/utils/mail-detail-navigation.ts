export type MailNavigationContext = {
  orderedIds: string[]
  folderKey: string | null
  folderById: Record<string, string>
  page: number
  totalPages: number
}

export function buildMailFolderKey(accountId: string, folder: string): string {
  return `${accountId}/${folder}`
}

export function isMailDetailPath(pathname: string, folder: string): boolean {
  if (!folder) return false

  const decodedPathname = decodeURIComponent(pathname)
  const folderIndex = decodedPathname.lastIndexOf(`/${folder}`)
  if (folderIndex === -1) return false

  const afterFolder = decodedPathname
    .slice(folderIndex + folder.length + 1)
    .split('?')[0]
    .replace(/^\/+/, '')
  const mailSegment = afterFolder.split('/')[0]

  return Boolean(mailSegment)
}

export function resolveMailIdFromPath(
  pathname: string,
  folder: string
): string | null {
  if (!isMailDetailPath(pathname, folder)) return null

  const decodedPathname = decodeURIComponent(pathname)
  const folderIndex = decodedPathname.lastIndexOf(`/${folder}`)
  const afterFolder = decodedPathname
    .slice(folderIndex + folder.length + 1)
    .split('?')[0]
    .replace(/^\/+/, '')

  const mailSegment = afterFolder.split('/')[0]
  return mailSegment ? decodeURIComponent(mailSegment) : null
}

/**
 * List query params kept in the URL while a mail is open, so the list (split
 * view, back to list, prev/next) keeps showing the same quick filter.
 */
const KEPT_LIST_PARAMS = ['filter'] as const

type ParamsSource = { get(name: string): string | null } | null | undefined

/** The kept list params of `source`, as a query string without `?`. */
export function keptListQuery(source: ParamsSource): string {
  const params = new URLSearchParams()
  for (const key of KEPT_LIST_PARAMS) {
    const value = source?.get(key)
    if (value) params.set(key, value)
  }
  return params.toString()
}

/** Adds the kept list params of `source` to `href`. */
export function withKeptListParams(href: string, source: ParamsSource): string {
  return appendQuery(href, keptListQuery(source))
}

/** Adds a query string (without `?`) to `href`, which may already have one. */
export function appendQuery(href: string, query: string): string {
  if (!query) return href
  return `${href}${href.includes('?') ? '&' : '?'}${query}`
}
