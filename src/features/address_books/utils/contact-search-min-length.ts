import { DEFAULT_CONTACT_SEARCH_MIN_LENGTH } from '../address-books-constants'

export function resolveContactSearchMinLength(
  configured?: number | string | null
): number {
  if (typeof configured === 'number' && configured >= 0) {
    return configured
  }

  if (typeof configured === 'string') {
    const parsed = Number.parseInt(configured, 10)
    if (!Number.isNaN(parsed) && parsed >= 0) {
      return parsed
    }
  }

  return DEFAULT_CONTACT_SEARCH_MIN_LENGTH
}
