import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

const mockUseAddressBookEntries = jest.fn()
const mockUseAllContactsEntries = jest.fn()

jest.mock('../use-address-book-entries', () => ({
  useAddressBookEntries: (...args: unknown[]) => mockUseAddressBookEntries(...args),
}))

jest.mock('../use-all-contacts-entries', () => ({
  useAllContactsEntries: (...args: unknown[]) => mockUseAllContactsEntries(...args),
}))

import { ALL_CONTACTS_BOOK_ID } from '../../address-books-constants'
import {
  AddressBookEntriesProvider,
  useAddressBookEntriesContext,
} from '../address-book-entries-context'

const bookEntries = {
  items: [{ id: 'book-contact' }],
  total: 1,
  isLoading: false,
}

const allContactsEntries = {
  items: [{ id: 'all-contact' }],
  total: 2,
  isLoading: false,
}

function Consumer() {
  const { items, total } = useAddressBookEntriesContext()
  return (
    <div>
      <span data-testid="first-id">{items[0]?.id ?? 'none'}</span>
      <span data-testid="total">{total}</span>
    </div>
  )
}

describe('AddressBookEntriesProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAddressBookEntries.mockReturnValue(bookEntries)
    mockUseAllContactsEntries.mockReturnValue(allContactsEntries)
  })

  it('exposes book entries for a specific book id', () => {
    render(
      <AddressBookEntriesProvider bookId="work">
        <Consumer />
      </AddressBookEntriesProvider>
    )

    expect(mockUseAddressBookEntries).toHaveBeenCalledWith('work')
    expect(mockUseAllContactsEntries).toHaveBeenCalledWith(false)
    expect(screen.getByTestId('first-id')).toHaveTextContent('book-contact')
    expect(screen.getByTestId('total')).toHaveTextContent('1')
  })

  it('exposes all-contacts entries when book id is the aggregate view', () => {
    render(
      <AddressBookEntriesProvider bookId={ALL_CONTACTS_BOOK_ID}>
        <Consumer />
      </AddressBookEntriesProvider>
    )

    expect(mockUseAddressBookEntries).toHaveBeenCalledWith(null)
    expect(mockUseAllContactsEntries).toHaveBeenCalledWith(true)
    expect(screen.getByTestId('first-id')).toHaveTextContent('all-contact')
    expect(screen.getByTestId('total')).toHaveTextContent('2')
  })
})

describe('useAddressBookEntriesContext', () => {
  it('throws when used outside AddressBookEntriesProvider', () => {
    expect(() => render(<Consumer />)).toThrow(
      'useAddressBookEntriesContext must be used within AddressBookEntriesProvider'
    )
  })
})
