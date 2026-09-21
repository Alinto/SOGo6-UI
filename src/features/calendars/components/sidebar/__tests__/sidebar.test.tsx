import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'

const mockData = [
  {
    key: 'p1',
    id: 'p1',
    name: 'Personal',
    source_type: 'personal',
    is_default: true,
    color: '#111',
  },
  {
    key: 'local1',
    id: 'local1',
    name: 'Backend Local',
    source_type: 'local',
    color: '#333',
  },
  {
    key: 's1',
    id: 's1',
    name: 'Shared',
    source_type: 'shared',
    color: '#222',
  },
]

const mockGetCalendarsQuery = jest.fn()

jest.mock('../../../store/calendars-api', () => ({
  useGetCalendarsQuery: (...a: unknown[]) => mockGetCalendarsQuery(...a),
}))

jest.mock('@/hooks/use-is-other-owner', () => {
  const isOtherOwner = (owner?: string) =>
    Boolean(owner) && owner !== 'me@tutu.fr'
  return { useIsOtherOwner: () => isOtherOwner }
})

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="group-label">{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: React.ReactNode }) => (
    <ul>{children}</ul>
  ),
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
}))

jest.mock('../forms/add', () => ({
  __esModule: true,
  default: function MockAddCalendar() {
    return <div data-testid="add-calendar" />
  },
}))

jest.mock('../forms/add-external', () => ({
  __esModule: true,
  default: function MockAddExternalCalendar() {
    return <div data-testid="add-external-calendar" />
  },
}))

jest.mock('../sidebar-item', () => ({
  __esModule: true,
  default: function MockSidebarItem({
    name,
    owner,
  }: {
    name: string
    owner?: string
  }) {
    return (
      <div data-testid={`item-${name}`} data-owner={owner}>
        {name}
      </div>
    )
  },
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: function MockSidebarSkeleton() {
    return <div data-testid="sidebar-skeleton" />
  },
}))

jest.mock('../create-event-opener', () => ({
  __esModule: true,
  default: function MockCreateEventOpener() {
    return <div data-testid="create-event-opener" />
  },
}))

import Sidebar from '../sidebar'

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('configuration', () => {
    it('shows skeleton while fetching', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: undefined,
        isFetching: true,
      })
      render(<Sidebar />)
      expect(screen.getByTestId('sidebar-skeleton')).toBeInTheDocument()
    })
  })

  describe('basic rendering', () => {
    it('renders grouped items when data is available', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: mockData,
        isFetching: false,
      })
      render(<Sidebar />)
      await waitFor(() => {
        expect(screen.getByText('sidebar.personals.string')).toBeInTheDocument()
      })
      expect(screen.getByText('sidebar.shared.string')).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.subscriptions.string')
      ).toBeInTheDocument()
    })

    it('lists backend local calendars under personals', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: mockData,
        isFetching: false,
      })
      render(<Sidebar />)
      await waitFor(() => {
        expect(screen.getByTestId('item-Backend Local')).toBeInTheDocument()
      })
    })
  })

  describe('shared calendars (owner)', () => {
    const groupOf = (name: string) => {
      const group = screen
        .getByTestId(`item-${name}`)
        .closest('[data-testid="group"]')
      return group?.querySelector('[data-testid="group-label"]')?.textContent
    }

    beforeEach(() => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [
          {
            key: 'mine',
            name: 'Mine',
            source_type: 'local',
            owner: 'me@tutu.fr',
          },
          {
            key: 'theirs',
            name: 'Theirs',
            source_type: 'local',
            owner: 'other@tutu.fr',
          },
          { key: 'legacy', name: 'Legacy shared', source_type: 'shared' },
          {
            key: 'mine-shared',
            name: 'Mine shared type',
            source_type: 'shared',
            owner: 'me@tutu.fr',
          },
        ],
        isFetching: false,
      })
    })

    it('keeps calendars owned by the connected account in personals', () => {
      render(<Sidebar />)
      expect(groupOf('Mine')).toBe('sidebar.personals.string')
    })

    it('puts calendars owned by someone else in shared and passes the owner', () => {
      render(<Sidebar />)
      expect(groupOf('Theirs')).toBe('sidebar.shared.string')
      expect(screen.getByTestId('item-Theirs')).toHaveAttribute(
        'data-owner',
        'other@tutu.fr'
      )
    })

    it('trusts the owner over source_type when the owner is the connected account', () => {
      render(<Sidebar />)
      expect(groupOf('Mine shared type')).toBe('sidebar.personals.string')
    })

    it('falls back to source_type when there is no owner', () => {
      render(<Sidebar />)
      expect(groupOf('Legacy shared')).toBe('sidebar.shared.string')
    })
  })
})
