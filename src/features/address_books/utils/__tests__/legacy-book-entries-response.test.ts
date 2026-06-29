import type { VCard } from '../../address-books-types'
import { applyBookEntriesQuery } from '../apply-book-entries-query'
import {
  buildBookEntriesPaginationHeaders,
  hasBookEntriesListQuery,
  parseLegacyBookEntriesListResponse,
} from '../legacy-book-entries-response'

const sampleItems: VCard[] = [
  {
    id: '1',
    version: '4.0',
    firstName: 'John',
    lastName: 'Doe',
    emails: [],
  },
]

describe('legacy-book-entries-response', () => {
  it('detects list query params', () => {
    expect(hasBookEntriesListQuery(new URLSearchParams('search=joh'))).toBe(true)
    expect(hasBookEntriesListQuery(new URLSearchParams())).toBe(false)
  })

  it('builds pagination headers from query result', () => {
    const result = applyBookEntriesQuery(sampleItems, { search: 'john' })
    const headers = buildBookEntriesPaginationHeaders(result)

    expect(headers['X-List-Total']).toBe('0')
    expect(JSON.parse(headers['X-Pagination'])).toMatchObject({
      total: 1,
      page: 1,
      total_pages: 1,
    })
  })

  it('parses paginated fakeApi responses from headers', () => {
    const applied = applyBookEntriesQuery(sampleItems, { search: 'john' })
    const headers = new Headers(buildBookEntriesPaginationHeaders(applied))

    const parsed = parseLegacyBookEntriesListResponse(
      applied.items,
      { response: { headers } as Response },
      { search: 'john' }
    )

    expect(parsed.contactTotal).toBe(1)
    expect(parsed.items).toHaveLength(1)
  })

  it('falls back to in-memory query when headers are missing', () => {
    const parsed = parseLegacyBookEntriesListResponse(
      sampleItems,
      undefined,
      { search: 'john' }
    )

    expect(parsed.items).toHaveLength(1)
    expect(parsed.contactTotal).toBe(1)
  })
})
