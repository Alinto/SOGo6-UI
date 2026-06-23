import {
  parseXPaginationFromMeta,
  parseXPaginationHeader,
} from '../parse-x-pagination'

describe('parseXPaginationHeader', () => {
  it('parses pagination header json', () => {
    expect(
      parseXPaginationHeader(
        JSON.stringify({ total: 42, total_pages: 3, page: 2 })
      )
    ).toEqual({ total: 42, totalPages: 3, page: 2 })
  })

  it('returns null for missing header', () => {
    expect(parseXPaginationHeader(null)).toBeNull()
    expect(parseXPaginationHeader(undefined)).toBeNull()
  })

  it('returns null for invalid json', () => {
    expect(parseXPaginationHeader('not-json')).toBeNull()
  })
})

describe('parseXPaginationFromMeta', () => {
  it('reads X-Pagination header from RTK meta response', () => {
    const response = {
      headers: {
        get: (name: string) =>
          name === 'X-Pagination'
            ? JSON.stringify({ total: 10, total_pages: 2, page: 1 })
            : null,
      },
    } as Response

    expect(parseXPaginationFromMeta({ response })).toEqual({
      total: 10,
      totalPages: 2,
      page: 1,
    })
  })

  it('returns null when meta response is missing', () => {
    expect(parseXPaginationFromMeta(undefined)).toBeNull()
  })
})
