import {
  CONTACT_LOOKUP_MAX,
  CONTACT_LOOKUP_PAGE_SIZE,
  fetchAllDistributionLists,
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

  it('stops when the abort signal is triggered', async () => {
    const controller = new AbortController()
    controller.abort()

    const baseQuery = jest.fn()
    const map = await fetchContactLookupMap('book-1', baseQuery, {
      signal: controller.signal,
    })

    expect(baseQuery).not.toHaveBeenCalled()
    expect(map.size).toBe(0)
  })

  it('uses the transverse /contacts path for the all-contacts book id', async () => {
    const baseQuery = jest.fn().mockResolvedValueOnce({
      data: { data: { contacts: [] } },
      meta: { response: { headers: paginationHeaders(1, 1, 0) } },
    })

    await fetchContactLookupMap('all', baseQuery)

    expect(baseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'contacts' })
    )
  })

  it('exposes lookup safety constants', () => {
    expect(CONTACT_LOOKUP_PAGE_SIZE).toBeGreaterThan(0)
    expect(CONTACT_LOOKUP_MAX).toBeGreaterThan(CONTACT_LOOKUP_PAGE_SIZE)
  })
})

describe('fetchAllDistributionLists', () => {
  it('paginates lists with backend page size cap', async () => {
    const baseQuery = jest
      .fn()
      .mockResolvedValueOnce({
        data: { data: { lists: [{ key: 'l1', name: 'Team A', members: [] }] } },
        meta: { response: { headers: paginationHeaders(1, 2, 2) } },
      })
      .mockResolvedValueOnce({
        data: { data: { lists: [{ key: 'l2', name: 'Team B', members: [] }] } },
        meta: { response: { headers: paginationHeaders(2, 2, 2) } },
      })

    const result = await fetchAllDistributionLists('book-1', baseQuery)

    expect(baseQuery).toHaveBeenCalledTimes(2)
    expect(baseQuery.mock.calls[0][0].params?.page_size).toBe(
      CONTACT_LOOKUP_PAGE_SIZE
    )
    expect(result.lists).toHaveLength(2)
    expect(result.total).toBe(2)
  })
})
