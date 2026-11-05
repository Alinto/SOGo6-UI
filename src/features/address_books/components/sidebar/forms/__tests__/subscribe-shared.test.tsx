import { SHARED_USERS_PAGE_SIZE } from '@/components/shared-subscribe/shared-subscribe-dialog'
import type {
  SharedAddressBook,
  SharedAddressBookUser,
} from '@/features/address_books/address-books-types'
import { skipToken } from '@reduxjs/toolkit/query'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SubscribeSharedAddressBook from '../subscribe-shared'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: Record<string, unknown>) =>
    values ? `${key} ${JSON.stringify(values)}` : key,
}))

const mockUsersQuery = jest.fn()
const mockOwnerBooksQuery = jest.fn()
const mockSubscribe = jest.fn()
const mockUnwrap = jest.fn()

jest.mock('@/features/address_books/store/address-books-api', () => ({
  useGetSharedAddressBookUsersQuery: (...args: unknown[]) =>
    mockUsersQuery(...args),
  useGetSharedAddressBooksByOwnerQuery: (...args: unknown[]) =>
    mockOwnerBooksQuery(...args),
  useUpdateSharedAddressBookSubscriptionMutation: () => [mockSubscribe],
}))

jest.mock('@/components/ui/sidebar', () => {
  const ReactActual = jest.requireActual<typeof import('react')>('react')
  return {
    SidebarGroupAction: ReactActual.forwardRef<
      HTMLButtonElement,
      React.ButtonHTMLAttributes<HTMLButtonElement>
    >(function MockSidebarGroupAction(props, ref) {
      return <button ref={ref} type="button" {...props} />
    }),
  }
})

const OWNER = 'sogo-tests1@example.org'

const USERS: SharedAddressBookUser[] = [
  { owner: OWNER, username: 'Sogo test1' },
]

const BOOKS: SharedAddressBook[] = [
  {
    key: 'ab-1',
    name: 'Team contacts',
    description: null,
    owner: OWNER,
    subscribed: true,
  },
  {
    key: 'ab-2',
    name: 'Suppliers',
    description: null,
    owner: OWNER,
    subscribed: false,
  },
]

const openDialog = async () => {
  const user = userEvent.setup()
  render(<SubscribeSharedAddressBook />)
  await user.click(
    screen.getByRole('button', { name: 'shared_subscribe.add_title.string' })
  )
  return user
}

describe('SubscribeSharedAddressBook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUnwrap.mockResolvedValue(undefined)
    mockSubscribe.mockReturnValue({ unwrap: mockUnwrap })
    mockUsersQuery.mockImplementation((arg: unknown) =>
      arg === skipToken
        ? { isFetching: false, isError: false }
        : {
            data: { users: USERS, total_count: 1, total_pages: 1 },
            currentData: { users: USERS, total_count: 1, total_pages: 1 },
            isFetching: false,
            isError: false,
          }
    )
    mockOwnerBooksQuery.mockReturnValue({ data: BOOKS, isError: false })
  })

  it('lists the users sharing address books with the address book labels', async () => {
    await openDialog()

    expect(mockUsersQuery).toHaveBeenLastCalledWith(
      {
        page: 1,
        page_size: SHARED_USERS_PAGE_SIZE,
        search: '',
      },
      { refetchOnMountOrArgChange: true }
    )
    expect(
      screen.getByText('shared_subscribe.description.string')
    ).toBeInTheDocument()
    expect(screen.getByText('Sogo test1')).toBeInTheDocument()
  })

  it("shows the owner's address books with their state", async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: /Sogo test1/ }))

    expect(mockOwnerBooksQuery).toHaveBeenCalledWith(OWNER)
    expect(screen.getByText('Team contacts')).toBeInTheDocument()
    expect(screen.getByText('Suppliers')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'shared_subscribe.subscribed.string' })
    ).toBeDisabled()
  })

  it('subscribes with the address book key', async () => {
    const user = await openDialog()
    await user.click(screen.getByRole('button', { name: /Sogo test1/ }))
    await user.click(
      screen.getByRole('button', { name: 'shared_subscribe.subscribe.string' })
    )

    expect(mockSubscribe).toHaveBeenCalledWith({ key: 'ab-2', subscribe: true })
    expect(mockUnwrap).toHaveBeenCalled()
  })
})
