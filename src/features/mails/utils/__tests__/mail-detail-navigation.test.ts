import {
  appendQuery,
  isMailDetailPath,
  keptListQuery,
  resolveMailIdFromPath,
  withKeptListParams,
} from '../mail-detail-navigation'

describe('keptListQuery', () => {
  it('keeps only the list quick filter', () => {
    const params = new URLSearchParams('filter=unread&page=2&sort=t_asc')
    expect(keptListQuery(params)).toBe('filter=unread')
  })

  it('returns an empty string when there is nothing to keep', () => {
    expect(keptListQuery(new URLSearchParams('page=2'))).toBe('')
    expect(keptListQuery(new URLSearchParams('filter='))).toBe('')
    expect(keptListQuery(null)).toBe('')
    expect(keptListQuery(undefined)).toBe('')
  })

  it('encodes the filter value', () => {
    const params = new URLSearchParams()
    params.set('filter', 'a&b')
    expect(keptListQuery(params)).toBe('filter=a%26b')
  })
})

describe('appendQuery', () => {
  it('adds a query to a URL without one', () => {
    expect(appendQuery('/u/0/INBOX/1', 'filter=unread')).toBe(
      '/u/0/INBOX/1?filter=unread'
    )
  })

  it('adds a query to a URL that already has one', () => {
    expect(appendQuery('/u/0/INBOX?page=2', 'filter=unread')).toBe(
      '/u/0/INBOX?page=2&filter=unread'
    )
  })

  it('returns the URL unchanged for an empty query', () => {
    expect(appendQuery('/u/0/INBOX', '')).toBe('/u/0/INBOX')
  })
})

describe('withKeptListParams', () => {
  it('adds the kept list params to the URL', () => {
    const params = new URLSearchParams('filter=flagged&page=3')
    expect(withKeptListParams('/u/0/INBOX/7', params)).toBe(
      '/u/0/INBOX/7?filter=flagged'
    )
  })

  it('leaves the URL unchanged without a filter', () => {
    expect(withKeptListParams('/u/0/INBOX/7', new URLSearchParams())).toBe(
      '/u/0/INBOX/7'
    )
  })
})

describe('isMailDetailPath', () => {
  it('returns false on folder list URLs', () => {
    expect(isMailDetailPath('/en/u/0/INBOX', 'INBOX')).toBe(false)
    expect(isMailDetailPath('/u/0/INBOX', 'INBOX')).toBe(false)
  })

  it('returns true when a mail segment follows the folder', () => {
    expect(isMailDetailPath('/en/u/0/INBOX/inbox_001', 'INBOX')).toBe(true)
    expect(isMailDetailPath('/u/0/INBOX/inbox_001', 'INBOX')).toBe(true)
  })

  it('supports nested folder paths', () => {
    expect(isMailDetailPath('/en/u/0/Archive/Old', 'Archive/Old')).toBe(false)
    expect(isMailDetailPath('/en/u/0/Archive/Old/99', 'Archive/Old')).toBe(true)
  })
})

describe('resolveMailIdFromPath', () => {
  it('returns null on folder list URLs', () => {
    expect(resolveMailIdFromPath('/en/u/0/INBOX', 'INBOX')).toBeNull()
  })

  it('returns the mail id when present', () => {
    expect(resolveMailIdFromPath('/en/u/0/INBOX/inbox_001', 'INBOX')).toBe(
      'inbox_001'
    )
  })
})
