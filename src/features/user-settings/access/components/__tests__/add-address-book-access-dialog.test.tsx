import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  useGetAddressBooksQuery,
  useLazyGetAddressBookShareQuery,
  useSetAddressBookShareMutation,
} from '@/features/address_books/store/address-books-api'
import type { GlobalAccessUserEntry } from '../../store/access-api'
import AddAddressBookAccessDialog from '../add-address-book-access-dialog'

const mockSetAddressBookShare = jest.fn(() => ({ unwrap: () => Promise.resolve(undefined) }))
const mockFetchAddressBookShare = jest.fn()

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetAddressBooksQuery: jest.fn(),
  useLazyGetAddressBookShareQuery: jest.fn(),
  useSetAddressBookShareMutation: jest.fn(),
}))
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

const entry: GlobalAccessUserEntry = {
  key: 'newuser@example.com',
  uid: 'newuser@example.com',
  c_email: 'newuser@example.com',
  grants: [],
}

describe('AddAddressBookAccessDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useGetAddressBooksQuery as jest.Mock).mockReturnValue({
      data: {
        globals: [],
        personals: [{ id: 'book-1', name: 'My Contacts', type: 'personal' }],
        subscriptions: [],
      },
      isLoading: false,
    })
    ;(useSetAddressBookShareMutation as jest.Mock).mockReturnValue([
      mockSetAddressBookShare,
      { isLoading: false },
    ])
    mockFetchAddressBookShare.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          users: {
            carol: { uid: 'carol', c_email: 'carol@example.com', userClass: 'normal-user', rights: {} },
          },
        }),
    })
    ;(useLazyGetAddressBookShareQuery as jest.Mock).mockReturnValue([mockFetchAddressBookShare])
  })

  it('does not show a user list or add-user input — the dialog is scoped to entry', () => {
    render(<AddAddressBookAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    expect(screen.queryByText('carol@example.com')).not.toBeInTheDocument()
    expect(screen.queryByText(/addUser/)).not.toBeInTheDocument()
  })

  it('disables Share until at least one address book is selected', async () => {
    const user = userEvent.setup()
    render(<AddAddressBookAccessDialog open onOpenChange={jest.fn()} entry={entry} />)

    const shareButton = screen.getByText('addAccess.confirm.string')
    expect(shareButton).toBeDisabled()

    await user.click(screen.getByText('My Contacts'))
    expect(shareButton).not.toBeDisabled()
  })

  it('grants entry access to each selected address book', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<AddAddressBookAccessDialog open onOpenChange={onOpenChange} entry={entry} />)

    await user.click(screen.getByText('My Contacts'))
    await user.click(screen.getByText('addAccess.confirm.string'))

    await waitFor(() => {
      expect(mockFetchAddressBookShare).toHaveBeenCalledWith({ bookId: 'book-1' })
    })
    await waitFor(() => {
      expect(mockSetAddressBookShare).toHaveBeenCalledWith({
        bookId: 'book-1',
        users: [
          expect.objectContaining({ uid: 'carol' }),
          expect.objectContaining({ uid: 'newuser@example.com', c_email: 'newuser@example.com' }),
        ],
      })
    })
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false))
  })

  it('filters out address books already shared with this user and shows the all-shared message', () => {
    render(
      <AddAddressBookAccessDialog
        open
        onOpenChange={jest.fn()}
        entry={{
          ...entry,
          grants: [
            {
              domain: 'contact',
              itemKey: 'book-1',
              itemName: 'My Contacts',
              uid: entry.uid,
              c_email: entry.c_email,
              rights: {},
              allItemUsers: [],
            } as never,
          ],
        }}
      />
    )

    expect(screen.queryByText('My Contacts')).not.toBeInTheDocument()
    expect(screen.getByText('addAccess.allShared.string')).toBeInTheDocument()
  })
})
