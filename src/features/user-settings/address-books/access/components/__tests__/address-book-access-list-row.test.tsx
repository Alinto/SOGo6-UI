import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { useGetAddressBookShareQuery } from '@/features/address_books/store/address-books-api'
import AddressBookAccessListRow from '../address-book-access-list-row'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetAddressBookShareQuery: jest.fn(),
}))

jest.mock('@/features/address_books/components/sidebar/actions/share', () => ({
  __esModule: true,
  default: () => <div data-testid="share-address-book-action" />,
}))

const addressBook = { id: 'book-1', name: 'My Contacts' } as never

describe('AddressBookAccessListRow', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(
      (key: string, values?: Record<string, unknown>) =>
        values?.count !== undefined ? `${key} ${values.count}` : key
    )
  })

  it('shows "not shared" when nobody has access', () => {
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: { users: {} },
      isLoading: false,
    })

    render(<AddressBookAccessListRow addressBook={addressBook} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })

  it('never counts "any authenticated user" toward the people count, and shows it separately', () => {
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: {} },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { can_view: true },
          },
        },
      },
      isLoading: false,
    })

    render(<AddressBookAccessListRow addressBook={addressBook} />)

    expect(screen.getByText('row.sharedOne.string')).toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('shows only the "any authenticated user" line when no named user has access', () => {
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: { can_view: true },
          },
        },
      },
      isLoading: false,
    })

    render(<AddressBookAccessListRow addressBook={addressBook} />)

    expect(screen.queryByText(/row\.sharedOne/)).not.toBeInTheDocument()
    expect(screen.queryByText(/row\.sharedCount/)).not.toBeInTheDocument()
    expect(
      screen.getByText('row.anyAuthenticated.string')
    ).toBeInTheDocument()
  })

  it('does not show the "any authenticated user" line when it has no permissions selected', () => {
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          alice: { uid: 'alice', userClass: 'normal-user', rights: {} },
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: {},
          },
        },
      },
      isLoading: false,
    })

    render(<AddressBookAccessListRow addressBook={addressBook} />)

    expect(screen.getByText('row.sharedOne.string')).toBeInTheDocument()
    expect(
      screen.queryByText('row.anyAuthenticated.string')
    ).not.toBeInTheDocument()
  })

  it('shows "not shared" when the only entry is "any authenticated user" with no permissions', () => {
    ;(useGetAddressBookShareQuery as jest.Mock).mockReturnValue({
      data: {
        users: {
          anyauthenticated: {
            uid: 'anyauthenticated',
            userClass: 'any-authenticated-user',
            rights: {},
          },
        },
      },
      isLoading: false,
    })

    render(<AddressBookAccessListRow addressBook={addressBook} />)

    expect(screen.getByText('row.notShared.string')).toBeInTheDocument()
  })
})
