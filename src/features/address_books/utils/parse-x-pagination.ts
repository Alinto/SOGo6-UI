export interface PaginationHeader {
  total: number
  total_pages: number
  first_page?: number
  last_page?: number
  page: number
}

export interface ParsedPagination {
  total: number
  totalPages: number
  page: number
}

export function parseXPaginationHeader(
  header: string | null | undefined
): ParsedPagination | null {
  if (!header) return null

  try {
    const pagination: PaginationHeader = JSON.parse(header)
    return {
      total: pagination.total ?? 0,
      totalPages: pagination.total_pages ?? 1,
      page: pagination.page ?? 1,
    }
  } catch {
    return null
  }
}

export function parseXPaginationFromMeta(
  meta: { response?: Response } | undefined
): ParsedPagination | null {
  const header = meta?.response?.headers?.get('X-Pagination')
  return parseXPaginationHeader(header)
}
