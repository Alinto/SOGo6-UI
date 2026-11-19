import {
  toQuickFilterSearchBody,
  toQuickFilterSearchParams,
} from '../quick-filter-search'

describe('toQuickFilterSearchBody', () => {
  it.each([
    ['read', { is_read: true }],
    ['unread', { is_read: false }],
    ['flagged', { is_flagged: true }],
    ['attachments', { has_attachment: true }],
  ] as const)(
    'restricts the %s filter to the current folder only',
    (filter, criteria) => {
      expect(toQuickFilterSearchBody(filter, 'Archives/2026')).toEqual({
        ...criteria,
        folders: ['Archives/2026'],
        include_subfolders: false,
      })
    }
  )
})

describe('toQuickFilterSearchParams', () => {
  it('sorts newest first when the list has no chosen sort', () => {
    expect(toQuickFilterSearchParams({ page_size: '50' }, 2)).toEqual({
      page: 2,
      page_size: '50',
      sort_by: 'date',
      sort_order: 'desc',
    })
  })

  it('keeps the list sort and light fields', () => {
    expect(
      toQuickFilterSearchParams(
        {
          page_size: '20',
          fields: 'contents',
          fields_action: 'exclude',
          sort_by: 'size',
          sort_order: 'asc',
        },
        1
      )
    ).toEqual({
      page: 1,
      page_size: '20',
      fields: 'contents',
      fields_action: 'exclude',
      sort_by: 'size',
      sort_order: 'asc',
    })
  })
})
