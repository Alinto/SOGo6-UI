import { skipToken } from '@reduxjs/toolkit/query'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import SharedSubscribeDialog, {
  SHARED_USERS_PAGE_SIZE,
} from '../shared-subscribe-dialog'
import type {
  SharedSubscribeItem,
  SharedSubscribeLabels,
  SharedSubscribeUser,
  SharedSubscribeUsersPage,
  SharedSubscribeUsersResult,
} from '../types'

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

const LABELS: SharedSubscribeLabels = {
  addTitle: 'Add shared',
  description: 'Shared with you',
  searchLabel: 'Search by owner',
  searchPlaceholder: 'Owner…',
  loading: 'Loading users',
  error: 'Users error',
  empty: 'Nobody shares',
  subscribe: 'Subscribe',
  subscribed: 'Subscribed',
  ownerItemsLoading: 'Loading items',
  ownerItemsError: 'Items error',
  ownerItemsEmpty: 'No items',
  previousPage: 'Previous page',
  nextPage: 'Next page',
  page: (page, total) => `Page ${page} of ${total}`,
  currentPage: (page) => `Page ${page}`,
}

const OWNER_1 = 'sogo-tests1@example.org'
const OWNER_2 = 'sogo-tests2@example.org'

const USERS: SharedSubscribeUser[] = [
  { owner: OWNER_1, username: 'Sogo test1' },
  { owner: OWNER_2, username: 'Sogo test2' },
]

const FULL_PAGE: SharedSubscribeUser[] = Array.from(
  { length: SHARED_USERS_PAGE_SIZE },
  (_, index) => ({
    owner: `user-${index}@example.org`,
    username: `User ${index}`,
  })
)

const ITEMS_BY_OWNER: Record<string, SharedSubscribeItem[]> = {
  [OWNER_1]: [
    { key: 'item-1', name: 'Item 1', subscribed: true },
    { key: 'item-2', name: 'Item 2', subscribed: false },
  ],
  [OWNER_2]: [{ key: 'item-3', name: 'Item 3', subscribed: false }],
}

const mockUseUsers = jest.fn()
const mockUseOwnerItems = jest.fn()
const mockOnSubscribe = jest.fn()

/** Every page answers `response`, unless `pages` maps a page to its own. */
const mockUsers = (
  response: SharedSubscribeUsersPage = { users: USERS, total_pages: 1 },
  overrides: Partial<SharedSubscribeUsersResult> = {},
  pages: Record<number, SharedSubscribeUsersPage> = {}
) => {
  mockUseUsers.mockImplementation(
    (arg: unknown): SharedSubscribeUsersResult => {
      if (arg === skipToken) return { isFetching: false, isError: false }
      const page = pages[(arg as { page: number }).page] ?? response
      return {
        data: page,
        currentData: page,
        isFetching: false,
        isError: false,
        ...overrides,
      }
    }
  )
}

const openDialog = async () => {
  const user = userEvent.setup()
  render(
    <SharedSubscribeDialog
      labels={LABELS}
      useUsers={mockUseUsers}
      useOwnerItems={mockUseOwnerItems}
      onSubscribe={mockOnSubscribe}
      renderItemIcon={(item) => <span data-testid={`icon-${item.key}`} />}
    />
  )
  await user.click(screen.getByRole('button', { name: 'Add shared' }))
  return user
}

const usersArgs = () => mockUseUsers.mock.calls.map(([arg]) => arg)
const lastUsersArg = () => usersArgs().at(-1)

const pageButton = (name: 'Previous page' | 'Next page') =>
  screen.queryByRole('button', { name })

describe('SharedSubscribeDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockOnSubscribe.mockResolvedValue(undefined)
    mockUsers()
    mockUseOwnerItems.mockImplementation((owner: string) => ({
      items: ITEMS_BY_OWNER[owner],
      isError: false,
    }))
  })

  describe('users', () => {
    it('does not fetch users until the dialog is opened', () => {
      render(
        <SharedSubscribeDialog
          labels={LABELS}
          useUsers={mockUseUsers}
          useOwnerItems={mockUseOwnerItems}
          onSubscribe={mockOnSubscribe}
          renderItemIcon={() => null}
        />
      )

      expect(lastUsersArg()).toBe(skipToken)
    })

    it('fetches the first page when the dialog opens', async () => {
      await openDialog()

      expect(lastUsersArg()).toEqual({
        page: 1,
        page_size: SHARED_USERS_PAGE_SIZE,
        search: '',
      })
    })

    it('refetches the users each time the dialog opens', async () => {
      const firstPage = {
        page: 1,
        page_size: SHARED_USERS_PAGE_SIZE,
        search: '',
      }
      const user = await openDialog()

      expect(mockUseUsers).toHaveBeenLastCalledWith(firstPage, {
        refetchOnMountOrArgChange: true,
      })

      await user.keyboard('{Escape}')
      await waitFor(() => expect(lastUsersArg()).toBe(skipToken))

      mockUseUsers.mockClear()
      await user.click(screen.getByRole('button', { name: 'Add shared' }))

      expect(mockUseUsers).toHaveBeenLastCalledWith(firstPage, {
        refetchOnMountOrArgChange: true,
      })
    })

    it('shows each user with an avatar, the username and the email', async () => {
      await openDialog()

      expect(screen.getByText('Sogo test1')).toBeInTheDocument()
      expect(screen.getByText(OWNER_1)).toBeInTheDocument()
      expect(screen.getByText('Sogo test2')).toBeInTheDocument()
      expect(screen.getByText(OWNER_2)).toBeInTheDocument()
      expect(screen.getAllByText('ST')).toHaveLength(2)
    })

    it('shows the email once when the username is the email', async () => {
      mockUsers({
        users: [{ owner: 'solo@example.org', username: 'solo@example.org' }],
      })
      await openDialog()

      expect(screen.getAllByText('solo@example.org')).toHaveLength(1)
    })

    it('searches from the first page in a single request', async () => {
      mockUsers({ users: FULL_PAGE, total_pages: 3 })
      const user = await openDialog()
      await user.click(pageButton('Next page')!)
      const isFirstPageWithoutSearch = (arg: unknown) =>
        (arg as { page?: number })?.page === 1 &&
        (arg as { search?: string }).search === ''
      const before = usersArgs().filter(isFirstPageWithoutSearch).length

      await user.type(screen.getByLabelText('Search by owner'), ' sogo ')

      await waitFor(() =>
        expect(lastUsersArg()).toEqual({
          page: 1,
          page_size: SHARED_USERS_PAGE_SIZE,
          search: 'sogo',
        })
      )
      expect(usersArgs().filter(isFirstPageWithoutSearch)).toHaveLength(before)
    })

    it('shows a loading state before the first page arrives', async () => {
      mockUsers(undefined, {
        data: undefined,
        currentData: undefined,
        isFetching: true,
      })
      await openDialog()

      expect(
        screen.getByRole('status', { name: 'Loading users' })
      ).toBeInTheDocument()
    })

    it('shows an error when the users cannot be loaded', async () => {
      mockUsers(undefined, {
        data: undefined,
        currentData: undefined,
        isError: true,
      })
      await openDialog()

      expect(screen.getByRole('alert')).toHaveTextContent('Users error')
    })

    it('shows an empty state when nobody shares anything', async () => {
      mockUsers({ users: [], total_count: 0, total_pages: 0 })
      await openDialog()

      expect(screen.getByText('Nobody shares')).toBeInTheDocument()
      expect(pageButton('Next page')).not.toBeInTheDocument()
    })
  })

  describe('owner items', () => {
    it('loads the items of a user only once the user is expanded', async () => {
      const user = await openDialog()
      const ownerButton = screen.getByRole('button', { name: /Sogo test1/ })

      expect(ownerButton).toHaveAttribute('aria-expanded', 'false')
      expect(mockUseOwnerItems).not.toHaveBeenCalled()

      await user.click(ownerButton)

      expect(ownerButton).toHaveAttribute('aria-expanded', 'true')
      expect(mockUseOwnerItems).toHaveBeenCalledWith(OWNER_1)
      expect(mockUseOwnerItems).not.toHaveBeenCalledWith(OWNER_2)
      expect(screen.getByText('Item 1')).toBeInTheDocument()
      expect(screen.getByTestId('icon-item-1')).toBeInTheDocument()
      expect(screen.queryByText('Item 3')).not.toBeInTheDocument()

      await user.click(ownerButton)

      expect(ownerButton).toHaveAttribute('aria-expanded', 'false')
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument()
    })

    it('shows a disabled button for items already subscribed', async () => {
      const user = await openDialog()
      await user.click(screen.getByRole('button', { name: /Sogo test1/ }))

      expect(screen.getByRole('button', { name: 'Subscribed' })).toBeDisabled()
      expect(screen.getByRole('button', { name: 'Subscribe' })).toBeEnabled()
    })

    it('subscribes to the clicked item and blocks the other buttons meanwhile', async () => {
      let resolveSubscribe: () => void = () => undefined
      mockOnSubscribe.mockReturnValue(
        new Promise<void>((resolve) => {
          resolveSubscribe = resolve
        })
      )
      const user = await openDialog()
      await user.click(screen.getByRole('button', { name: /Sogo test1/ }))
      await user.click(screen.getByRole('button', { name: /Sogo test2/ }))
      const [first, second] = screen.getAllByRole('button', {
        name: 'Subscribe',
      })

      await user.click(first)

      expect(mockOnSubscribe).toHaveBeenCalledWith('item-2')
      expect(first).toHaveAttribute('aria-busy', 'true')
      expect(second).toBeDisabled()

      resolveSubscribe()
      await waitFor(() => expect(second).toBeEnabled())
    })

    it('shows the loading and error states of the items', async () => {
      mockUseOwnerItems.mockImplementation((owner: string) =>
        owner === OWNER_1
          ? { items: undefined, isError: false }
          : { items: undefined, isError: true }
      )
      const user = await openDialog()
      await user.click(screen.getByRole('button', { name: /Sogo test1/ }))
      await user.click(screen.getByRole('button', { name: /Sogo test2/ }))

      expect(
        screen.getByRole('status', { name: 'Loading items' })
      ).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('Items error')
    })

    it('tells when a user shares no items', async () => {
      mockUseOwnerItems.mockReturnValue({ items: [], isError: false })
      const user = await openDialog()
      await user.click(screen.getByRole('button', { name: /Sogo test1/ }))

      expect(screen.getByText('No items')).toBeInTheDocument()
    })
  })

  describe('pagination from X-Pagination', () => {
    it('shows no second page with exactly one full page', async () => {
      mockUsers({
        users: FULL_PAGE,
        total_count: SHARED_USERS_PAGE_SIZE,
        total_pages: 1,
      })
      await openDialog()

      expect(pageButton('Next page')).not.toBeInTheDocument()
      expect(pageButton('Previous page')).not.toBeInTheDocument()
    })

    it('pages through the users with the total', async () => {
      mockUsers({ users: FULL_PAGE, total_count: 25, total_pages: 2 })
      const user = await openDialog()

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
      expect(pageButton('Previous page')).toBeDisabled()

      await user.click(pageButton('Next page')!)

      expect(lastUsersArg()).toMatchObject({ page: 2 })
      expect(screen.getByText('Page 2 of 2')).toBeInTheDocument()
      expect(pageButton('Next page')).toBeDisabled()

      await user.click(pageButton('Previous page')!)

      expect(lastUsersArg()).toMatchObject({ page: 1 })
    })

    it('derives the pages from total_count alone', async () => {
      mockUsers({ users: FULL_PAGE, total_count: SHARED_USERS_PAGE_SIZE + 1 })
      await openDialog()

      expect(screen.getByText('Page 1 of 2')).toBeInTheDocument()
      expect(pageButton('Next page')).toBeEnabled()
    })

    it('disables the page buttons while a page is loading', async () => {
      mockUsers({ users: FULL_PAGE, total_pages: 2 }, { isFetching: true })
      await openDialog()

      expect(pageButton('Next page')).toBeDisabled()
    })
  })

  describe('pagination without any total', () => {
    it('offers the next page while pages are full', async () => {
      mockUsers({ users: FULL_PAGE }, {}, { 2: { users: USERS } })
      const user = await openDialog()

      expect(screen.getByText('Page 1')).toBeInTheDocument()
      expect(pageButton('Next page')).toBeEnabled()

      await user.click(pageButton('Next page')!)

      expect(lastUsersArg()).toMatchObject({ page: 2 })
      expect(screen.getByText('Sogo test1')).toBeInTheDocument()
      expect(pageButton('Previous page')).toBeEnabled()
      expect(pageButton('Next page')).toBeDisabled()
    })

    it('hides the pagination on a partial first page', async () => {
      mockUsers({ users: USERS })
      await openDialog()

      expect(pageButton('Next page')).not.toBeInTheDocument()
    })
  })
})
