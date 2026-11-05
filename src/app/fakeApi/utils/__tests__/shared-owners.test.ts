import {
  decodeOwnerParam,
  listSharedOwners,
  paginationHeaders,
  sharedOwnersPage,
} from '../shared-owners'

const ITEMS = [
  { owner: 'team-lead@example.com', name_owner: 'Team Lead' },
  { owner: 'team-lead@example.com', name_owner: 'Team Lead' },
  { owner: 'admin@example.com', name_owner: 'Administrator' },
  { owner: 'nameless@example.com', name_owner: null },
]

describe('shared-owners', () => {
  it('lists each owner once, in the order they first appear', () => {
    expect(listSharedOwners(ITEMS)).toEqual([
      { mail: 'team-lead@example.com', username: 'Team Lead' },
      { mail: 'admin@example.com', username: 'Administrator' },
      { mail: 'nameless@example.com', username: 'nameless@example.com' },
    ])
  })

  it('searches the email and the username, ignoring case', () => {
    expect(listSharedOwners(ITEMS, ' ADMIN ').map((u) => u.mail)).toEqual([
      'admin@example.com',
    ])
    expect(listSharedOwners(ITEMS, 'lead').map((u) => u.mail)).toEqual([
      'team-lead@example.com',
    ])
  })

  it('pages the owners like the backend, the totals going in the header', () => {
    const page = (query: string) =>
      sharedOwnersPage(new URLSearchParams(query), ITEMS)

    expect(page('page=2&page_size=2')).toEqual({
      body: {
        data: {
          users: [
            { mail: 'nameless@example.com', username: 'nameless@example.com' },
          ],
        },
        error_code: 'S000000',
        error_msg: 'No Error',
      },
      pagination: {
        total: 3,
        total_pages: 2,
        first_page: 1,
        last_page: 2,
        page: 2,
      },
    })
    expect(page('search=admin')).toMatchObject({
      body: {
        data: {
          users: [{ mail: 'admin@example.com', username: 'Administrator' }],
        },
      },
      pagination: { total: 1, total_pages: 1, page: 1 },
    })
  })

  it('reports a single page when nobody matches', () => {
    expect(
      sharedOwnersPage(new URLSearchParams('search=nobody'), ITEMS).pagination
    ).toMatchObject({ total: 0, total_pages: 1, last_page: 1 })
  })

  it('serializes the pagination into the X-Pagination header', () => {
    expect(paginationHeaders({ total: 2, page: 1 })).toEqual({
      'X-Pagination': '{"total":2,"page":1}',
    })
  })

  it('decodes an encoded owner and keeps a decoded one', () => {
    expect(decodeOwnerParam('admin%40example.com')).toBe('admin@example.com')
    expect(decodeOwnerParam('admin@example.com')).toBe('admin@example.com')
    expect(decodeOwnerParam('100%')).toBe('100%')
  })
})
