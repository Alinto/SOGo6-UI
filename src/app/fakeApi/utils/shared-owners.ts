type OwnedItem = { owner: string; name_owner?: string | null }

/** Same shape as the backend: the email is `mail`. */
export type SharedOwnerUser = { mail: string; username: string }

/**
 * Unique owners of `items`, in the order they first appear, whose email or
 * display name contains `search` (case-insensitive).
 */
export function listSharedOwners(
  items: OwnedItem[],
  search = ''
): SharedOwnerUser[] {
  const users = new Map<string, SharedOwnerUser>()
  for (const item of items) {
    if (!users.has(item.owner)) {
      users.set(item.owner, {
        mail: item.owner,
        username: item.name_owner || item.owner,
      })
    }
  }
  const term = search.trim().toLowerCase()
  return Array.from(users.values()).filter(
    (user) =>
      !term ||
      user.mail.toLowerCase().includes(term) ||
      user.username.toLowerCase().includes(term)
  )
}

/**
 * One page of owners for `?page=&page_size=&search=`. Like the backend, the
 * body has no total: it goes in the `X-Pagination` header (`pagination`).
 */
export function sharedOwnersPage(
  searchParams: URLSearchParams,
  items: OwnedItem[]
) {
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const pageSize = Math.max(1, Number(searchParams.get('page_size')) || 20)
  const matching = listSharedOwners(items, searchParams.get('search') ?? '')
  const start = (page - 1) * pageSize
  const totalPages = Math.max(1, Math.ceil(matching.length / pageSize))

  return {
    body: {
      data: { users: matching.slice(start, start + pageSize) },
      error_code: 'S000000',
      error_msg: 'No Error',
    },
    pagination: {
      total: matching.length,
      total_pages: totalPages,
      first_page: 1,
      last_page: totalPages,
      page,
    },
  }
}

/** `X-Pagination` header carrying `pagination`, as the backend sends it. */
export function paginationHeaders(pagination: object) {
  return { 'X-Pagination': JSON.stringify(pagination) }
}

/** Route params may arrive encoded or not; decoding an email twice is safe. */
export function decodeOwnerParam(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}
