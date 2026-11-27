import {
  buildMailSearchParams,
  defaultSearchFormValues,
  mailSearchParamsToQueryText,
  queryTextToSearchFormValues,
} from '../mail-search-form'
import {
  applyQuickFilterToSearch,
  quickFilterToSearchParams,
  searchParamsToQuickFilter,
  toMatchAll,
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

  it('asks for every label', () => {
    expect(
      toQuickFilterSearchBody(undefined, 'INBOX', ['Work', 'toto'])
    ).toEqual({
      labels: ['Work', 'toto'],
      folders: ['INBOX'],
      include_subfolders: false,
    })
  })

  it('keeps the status filter next to the labels', () => {
    expect(toQuickFilterSearchBody('unread', 'INBOX', ['Work'])).toEqual({
      is_read: false,
      labels: ['Work'],
      folders: ['INBOX'],
      include_subfolders: false,
    })
  })
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

describe('quickFilterToSearchParams', () => {
  it('returns null without quick filter', () => {
    expect(quickFilterToSearchParams(undefined, [])).toBeNull()
  })

  it.each([
    ['read', 'is:read'],
    ['unread', 'is:unread'],
    ['flagged', 'is:flagged'],
    ['attachments', 'has:attachment'],
  ] as const)('shows the %s filter as "%s"', (filter, text) => {
    expect(
      mailSearchParamsToQueryText(quickFilterToSearchParams(filter, [])!)
    ).toBe(text)
  })

  it('shows the labels as a match:all search', () => {
    expect(
      mailSearchParamsToQueryText(quickFilterToSearchParams('read', ['Work'])!)
    ).toBe('is:read label:Work')
    expect(
      mailSearchParamsToQueryText(
        quickFilterToSearchParams(undefined, ['Work', 'To do'])!
      )
    ).toBe('label:Work label:"To do"')
  })
})

describe('applyQuickFilterToSearch', () => {
  const andSearch = { subject: 'invoice', folders: ['INBOX'] }
  const orSearch = { subject: 'tutu', from: ['tutu'], operator: 'OR' as const }

  it('leaves the search unchanged without quick filter', () => {
    expect(applyQuickFilterToSearch(andSearch, undefined, [])).toEqual({
      params: andSearch,
      clientLabels: [],
      applied: false,
    })
  })

  it.each([
    ['read', { is_read: true }],
    ['unread', { is_read: false }],
    ['flagged', { is_flagged: true }],
    ['attachments', { has_attachment: true }],
  ] as const)(
    'adds the %s filter, turning an OR search into a match:all one',
    (filter, criteria) => {
      expect(applyQuickFilterToSearch(orSearch, filter, [])).toEqual({
        params: { ...orSearch, ...criteria, operator: 'AND' },
        clientLabels: [],
        applied: true,
      })
    }
  )

  it('overrides the read status of the search', () => {
    expect(
      applyQuickFilterToSearch({ ...andSearch, is_read: true }, 'unread', [])
        .params.is_read
    ).toBe(false)
  })

  it('is not applied when the search already has the filter', () => {
    expect(
      applyQuickFilterToSearch({ ...andSearch, is_read: true }, 'read', [])
        .applied
    ).toBe(false)
  })

  it('adds a label to an AND search', () => {
    expect(
      applyQuickFilterToSearch({ ...andSearch, labels: ['Home'] }, undefined, [
        'Work',
      ])
    ).toEqual({
      params: { ...andSearch, labels: ['Home', 'Work'] },
      clientLabels: [],
      applied: true,
    })
  })

  it('requires every label on a search without criteria', () => {
    expect(
      applyQuickFilterToSearch({ folders: ['all'] }, 'read', ['Work', 'Home'])
        .params
    ).toEqual({
      folders: ['all'],
      is_read: true,
      labels: ['Work', 'Home'],
    })
  })

  it('adds several labels to an AND search with criteria', () => {
    expect(
      applyQuickFilterToSearch(andSearch, undefined, ['Work', 'Home']).params
    ).toEqual({ ...andSearch, labels: ['Work', 'Home'] })
  })

  it('adds only the labels the AND search does not already require', () => {
    expect(
      applyQuickFilterToSearch({ ...andSearch, labels: ['work'] }, undefined, [
        'Work',
        'Home',
      ])
    ).toEqual({
      params: { ...andSearch, labels: ['work', 'Home'] },
      clientLabels: [],
      applied: true,
    })
  })

  it('does nothing for labels the AND search already requires', () => {
    expect(
      applyQuickFilterToSearch({ ...andSearch, labels: ['work'] }, undefined, [
        'Work',
      ]).applied
    ).toBe(false)
  })

  it('turns an OR search without criteria into a match:all one', () => {
    expect(
      applyQuickFilterToSearch(
        { folders: ['all'], operator: 'OR' },
        undefined,
        ['Work', 'Home']
      ).params
    ).toEqual({
      folders: ['all'],
      labels: ['Work', 'Home'],
      operator: 'AND',
    })
  })

  it('requires the labels on an OR search with criteria, as match:all', () => {
    expect(applyQuickFilterToSearch(orSearch, undefined, ['Work'])).toEqual({
      params: { ...orSearch, labels: ['Work'], operator: 'AND' },
      clientLabels: [],
      applied: true,
    })
  })

  it('keeps the labels of an OR search, now all required', () => {
    expect(
      applyQuickFilterToSearch(
        { folders: ['all'], labels: ['Home'], operator: 'OR' },
        'read',
        ['Work', 'home']
      ).params
    ).toEqual({
      folders: ['all'],
      labels: ['Home', 'Work'],
      is_read: true,
      operator: 'AND',
    })
  })
})

describe('searchParamsToQuickFilter', () => {
  const parse = (text: string, folder = 'INBOX') =>
    buildMailSearchParams(
      queryTextToSearchFormValues(text, { ...defaultSearchFormValues, folder })
    )

  it('round-trips the text shown for a quick filter', () => {
    const text = mailSearchParamsToQueryText(
      quickFilterToSearchParams('unread', ['Work', 'To do'])!
    )
    expect(searchParamsToQuickFilter(parse(text), 'INBOX')).toEqual({
      filter: 'unread',
      labels: ['Work', 'To do'],
    })
  })

  it('gives an empty quick filter for an empty query', () => {
    expect(searchParamsToQuickFilter(parse(''), 'INBOX')).toEqual({
      filter: undefined,
      labels: [],
    })
  })

  it.each([
    ['text criteria', 'is:read invoice'],
    ['a field criterion', 'from:jane has:attachment'],
    ['several status filters', 'is:read has:attachment'],
    ['labels to match any of', 'match:any label:Work label:Home'],
    ['another folder', 'is:read in:Archives'],
    ['subfolders', 'is:read subfolders:true'],
    ['a date', 'is:read after:2026-01-01'],
  ])('needs a real search with %s', (_, text) => {
    expect(searchParamsToQuickFilter(parse(text), 'INBOX')).toBeNull()
  })
})

describe('toMatchAll', () => {
  it('drops the OR operator', () => {
    expect(
      toMatchAll({ subject: 'x', labels: ['Work'], operator: 'OR' })
    ).toEqual({ subject: 'x', labels: ['Work'] })
  })

  it('returns a match:all search as is', () => {
    const search = { subject: 'x', operator: 'AND' as const }
    expect(toMatchAll(search)).toBe(search)
  })
})
