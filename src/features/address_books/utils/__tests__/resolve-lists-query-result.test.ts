import { parseContactsAndListsFromBackend } from '../merge-book-entries'
import { resolveListsQueryResult } from '../resolve-lists-query-result'

const contactsPayload = {
  data: {
    contacts: [
      {
        key: 'c1',
        first_name: 'Alice',
        last_name: 'Martin',
      },
    ],
  },
  error_code: 'S000000',
}

describe('resolveListsQueryResult', () => {
  it('keeps contacts when the lists request fails', () => {
    const lists = resolveListsQueryResult({
      error: { status: 405, data: { error_code: 'S000707' } },
    })

    const result = parseContactsAndListsFromBackend(
      contactsPayload,
      lists.payload,
      { total: 1, totalPages: 1, page: 1 },
      undefined,
      lists.pagination
    )

    expect(result.items.map((item) => item.id)).toEqual(['c1'])
    expect(result.contactTotal).toBe(1)
    expect(result.listTotal).toBe(0)
  })

  it('keeps the lists payload when the request succeeds', () => {
    const header = JSON.stringify({ total: 1, total_pages: 1, page: 1 })
    const lists = resolveListsQueryResult({
      data: {
        data: { lists: [{ key: 'l1', name: 'Team', members: [] }] },
        error_code: 'S000000',
      },
      meta: {
        response: {
          headers: { get: () => header },
        } as unknown as Response,
      },
    })

    const result = parseContactsAndListsFromBackend(
      contactsPayload,
      lists.payload,
      { total: 1, totalPages: 1, page: 1 },
      undefined,
      lists.pagination
    )

    expect(result.items.map((item) => item.id)).toEqual(['l1', 'c1'])
    expect(result.listTotal).toBe(1)
  })
})
