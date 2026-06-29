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
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({
    children,
    onClick,
  }: {
    children: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
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
  default: ({ id, name }: { id: string; name: string }) => (
    <div data-testid={`sidebar-item-${id}`}>{name}</div>
  ),
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="sidebar-skeleton" />,
}))

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
      expect(screen.getByTestId('sidebar-item-p1')).toHaveTextContent('Personal')
      expect(screen.getByTestId('sidebar-item-s1')).toHaveTextContent('Shared')
      expect(screen.getByTestId('sidebar-item-g1')).toHaveTextContent('Global')
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
