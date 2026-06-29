import {
  ALL_CONTACTS_BOOK_ID,
  BACKEND_MAX_PAGE_SIZE,
  CONTACT_LOOKUP_MAX,
  CONTACT_LOOKUP_PAGE_SIZE,
  DEFAULT_CONTACT_SEARCH_MIN_LENGTH,
  FULL_LISTS_PAGE_SIZE,
} from '../address-books-constants'

describe('address-books-constants', () => {
  it('exports search and pagination defaults', () => {
    expect(DEFAULT_CONTACT_SEARCH_MIN_LENGTH).toBe(2)
    expect(BACKEND_MAX_PAGE_SIZE).toBe(100)
    expect(FULL_LISTS_PAGE_SIZE).toBe(BACKEND_MAX_PAGE_SIZE)
    expect(CONTACT_LOOKUP_PAGE_SIZE).toBe(BACKEND_MAX_PAGE_SIZE)
    expect(CONTACT_LOOKUP_MAX).toBe(5000)
  })

  it('exports all-contacts book id', () => {
    expect(ALL_CONTACTS_BOOK_ID).toBe('all')
  })
})
