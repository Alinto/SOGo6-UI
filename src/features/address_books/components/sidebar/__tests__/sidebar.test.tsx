import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

const mockUseGetAddressBooksQuery = jest.fn()

jest.mock('../../../store/address-books-api', () => ({
  useGetAddressBooksQuery: () => mockUseGetAddressBooksQuery(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('@/hooks/use-is-other-owner', () => {
  const isOtherOwner = (owner?: string) =>
    Boolean(owner) && owner !== 'me@tutu.fr'
  return { useIsOtherOwner: () => isOtherOwner }
})

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({})),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-label">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group-content">{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    isActive,
  }: {
    children: React.ReactNode
    onClick?: () => void
    isActive?: boolean
  }) => (
    <button type="button" data-active={isActive} onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/dnd/droppable', () => ({
  __esModule: true,
  default: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div data-testid={`droppable-${id}`}>{children}</div>
  ),
}))

jest.mock('../forms/add', () => ({
  __esModule: true,
  default: ({ type }: { type: string }) => (
    <div data-testid={`add-address-book-${type}`} />
  ),
}))

jest.mock('../create-contact-opener', () => ({
  __esModule: true,
  default: () => <div data-testid="create-contact-opener" />,
}))

jest.mock('../sidebar-item', () => ({
  __esModule: true,
  default: ({
    id,
    name,
    owner,
    sharingAction,
  }: {
    id: string
    name: string
    owner?: string
    sharingAction?: boolean
  }) => (
    <div
      data-testid={`sidebar-item-${id}`}
      data-owner={owner}
      data-sharing-action={sharingAction}
    >
      {name}
    </div>
  ),
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-skeleton" />,
}))

import { useParams } from 'next/navigation'
import Sidebar from '../sidebar'

describe('AddressBooks Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders skeleton while fetching', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      })

      render(<Sidebar />)
      expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument()
    })

    it('renders address book groups when data is loaded', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [{ id: 'p1', name: 'Personal', default: true }],
          subscriptions: [{ id: 's1', name: 'Shared' }],
          globals: [{ id: 'g1', name: 'Global' }],
        },
        isFetching: false,
      })

      render(<Sidebar />)

      expect(screen.getByTestId('create-contact-opener')).toBeInTheDocument()
      expect(screen.getByText('personals.string')).toBeInTheDocument()
      expect(screen.getByText('subscriptions.string')).toBeInTheDocument()
      expect(screen.getByText('globals.string')).toBeInTheDocument()
      expect(screen.getByTestId('sidebar-item-p1')).toHaveTextContent(
        'Personal'
      )
      expect(screen.getByTestId('sidebar-item-s1')).toHaveTextContent('Shared')
      expect(screen.getByTestId('sidebar-item-g1')).toHaveTextContent('Global')
    })

    it('highlights all contacts when that route is active', () => {
      jest.mocked(useParams).mockReturnValue({ book_id: 'all' })
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [],
          subscriptions: [],
          globals: [],
        },
        isFetching: false,
      })

      render(<Sidebar />)

      expect(
        screen.getByText('all_contacts.string').closest('button')
      ).toHaveAttribute('data-active', 'true')
    })

    it('renders error state when query fails', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: undefined,
        isFetching: false,
        isError: true,
      })

      render(<Sidebar />)
      expect(screen.getByText('load_error.list.string')).toBeInTheDocument()
    })
  })

  describe('shared address books (owner)', () => {
    const groupOf = (id: string) =>
      screen
        .getByTestId(`sidebar-item-${id}`)
        .closest('[data-testid="sidebar-group"]')
        ?.querySelector('[data-testid="sidebar-group-label"]')?.textContent

    beforeEach(() => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [
            { id: 'mine', name: 'Mine', owner: 'me@tutu.fr' },
            { id: 'theirs', name: 'Theirs', owner: 'other@tutu.fr' },
          ],
          subscriptions: [
            { id: 'sub', name: 'Sub', owner: 'me@tutu.fr' },
            { id: 'sub-theirs', name: 'Sub theirs', owner: 'other@tutu.fr' },
          ],
          globals: [],
        },
        isFetching: false,
      })
    })

    it('keeps books owned by the connected account in their section', () => {
      render(<Sidebar />)
      expect(groupOf('mine')).toBe('personals.string')
      expect(groupOf('sub')).toBe('subscriptions.string')
    })

    it('lists books owned by someone else under shared, with their owner', () => {
      render(<Sidebar />)
      expect(groupOf('theirs')).toBe('shared.string')
      expect(groupOf('sub-theirs')).toBe('shared.string')
      expect(screen.getByTestId('sidebar-item-theirs')).toHaveAttribute(
        'data-owner',
        'other@tutu.fr'
      )
    })

    it('does not offer sharing on shared books', () => {
      render(<Sidebar />)
      expect(screen.getByTestId('sidebar-item-theirs')).toHaveAttribute(
        'data-sharing-action',
        'false'
      )
    })
  })

  describe('integration', () => {
    it('renders personal books without drag-and-drop wrappers', () => {
      mockUseGetAddressBooksQuery.mockReturnValue({
        data: {
          personals: [{ id: 'p1', name: 'Personal', default: true }],
          subscriptions: [],
          globals: [],
        },
        isFetching: false,
      })

      render(<Sidebar />)
      expect(screen.getByTestId('sidebar-item-p1')).toBeInTheDocument()
      expect(screen.queryByTestId('droppable-p1')).not.toBeInTheDocument()
    })
  })
})
