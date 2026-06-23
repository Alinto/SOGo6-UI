import {
  CONTACT_LOOKUP_MAX,
  CONTACT_LOOKUP_PAGE_SIZE,
  fetchContactLookupMap,
} from '../fetch-contact-lookup-map'

function paginationHeaders(page: number, totalPages: number, total: number) {
  return new Headers({
    'X-Pagination': JSON.stringify({
      total,
      total_pages: totalPages,
      page,
    }),
  })
}

describe('fetchContactLookupMap', () => {
  it('paginates through contacts until all pages are loaded', async () => {
    const baseQuery = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          data: {
            contacts: [
              { key: 'c1', first_name: 'Alice', last_name: 'Martin' },
            ],
          },
        },
        meta: {
          response: {
            headers: paginationHeaders(1, 2, 2),
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          data: {
            contacts: [{ key: 'c2', first_name: 'Bob', last_name: 'Smith' }],
          },
        },
        meta: {
          response: {
            headers: paginationHeaders(2, 2, 2),
          },
        },
      })

    const map = await fetchContactLookupMap('book-1', baseQuery)

    expect(baseQuery).toHaveBeenCalledTimes(2)
    expect(map.size).toBe(2)
    expect(map.get('c1')?.firstName).toBe('Alice')
    expect(map.get('c2')?.firstName).toBe('Bob')
  })

  it('stops when baseQuery returns an error', async () => {
    const baseQuery = jest.fn().mockResolvedValueOnce({ error: { status: 500 } })
    const map = await fetchContactLookupMap('book-1', baseQuery)

    expect(map.size).toBe(0)
  })

  it('exposes lookup safety constants', () => {
    expect(CONTACT_LOOKUP_PAGE_SIZE).toBeGreaterThan(0)
    expect(CONTACT_LOOKUP_MAX).toBeGreaterThan(CONTACT_LOOKUP_PAGE_SIZE)
  })
})
