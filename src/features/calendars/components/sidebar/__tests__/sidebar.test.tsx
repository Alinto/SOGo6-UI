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
  SidebarMenuButton: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    'aria-label'?: string
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ),
  SidebarSeparator: () => <hr data-testid="separator" />,
  useSidebar: jest.fn(),
}))

let mockRailHeight: number | null = null

jest.mock('@/hooks/use-element-height', () => ({
  useElementHeight: () => ({ ref: jest.fn(), height: mockRailHeight }),
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

jest.mock('../forms/subscribe-shared', () => ({
  __esModule: true,
  default: function MockSubscribeSharedCalendar() {
    return <div data-testid="subscribe-shared-calendar" />
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

import {
  RAIL_GAP,
  RAIL_ROW_HEIGHT,
} from '@/components/sidebar/fit-rail-sections'
import { useSidebar } from '@/components/ui/sidebar'
import userEvent from '@testing-library/user-event'
import Sidebar from '../sidebar'

const mockSetOpen = jest.fn()

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRailHeight = null
    jest.mocked(useSidebar).mockReturnValue({
      state: 'expanded',
      setOpen: mockSetOpen,
    } as unknown as ReturnType<typeof useSidebar>)
  })

  describe('icon rail (collapsed sidebar)', () => {
    const personal = { key: 'p1', name: 'Personal', source_type: 'personal' }
    const shared = {
      key: 'sh1',
      name: 'Theirs',
      source_type: 'shared',
      owner: 'other@tutu.fr',
    }
    const subscription = { key: 'sub1', name: 'Holidays', source_type: 'ics' }

    const renderRail = (data: unknown[]) => {
      mockGetCalendarsQuery.mockReturnValue({ data, isFetching: false })
      render(<Sidebar />)
    }

    beforeEach(() => {
      jest.mocked(useSidebar).mockReturnValue({
        state: 'collapsed',
        setOpen: mockSetOpen,
      } as unknown as ReturnType<typeof useSidebar>)
    })

    it('shows only the calendars that fit, then a "+N" entry', () => {
      // Room for 2 rows: 1 calendar and the "+N" entry.
      mockRailHeight = 2 * RAIL_ROW_HEIGHT + RAIL_GAP

      renderRail([personal, shared, subscription])

      expect(screen.getByTestId('item-Personal')).toBeInTheDocument()
      expect(screen.queryByTestId('item-Theirs')).not.toBeInTheDocument()
      expect(screen.queryByTestId('item-Holidays')).not.toBeInTheDocument()
      expect(screen.queryByTestId('separator')).not.toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'sidebar.railMore.string' })
      ).toHaveTextContent('sidebar.rail_more_badge.string')
    })

    it('expands the sidebar from the "+N" entry', async () => {
      mockRailHeight = 2 * RAIL_ROW_HEIGHT + RAIL_GAP
      renderRail([personal, shared, subscription])

      await userEvent.click(
        screen.getByRole('button', { name: 'sidebar.railMore.string' })
      )

      expect(mockSetOpen).toHaveBeenCalledWith(true)
    })

    it('has no "+N" entry when every calendar fits', () => {
      mockRailHeight = 1000

      renderRail([personal, shared, subscription])

      expect(screen.getByTestId('item-Holidays')).toBeInTheDocument()
      expect(
        screen.queryByRole('button', { name: 'sidebar.railMore.string' })
      ).not.toBeInTheDocument()
    })

    it('lists every calendar with a line between the three sections', () => {
      renderRail([personal, shared, subscription])

      expect(screen.getByTestId('create-event-opener')).toBeInTheDocument()
      expect(screen.getByTestId('item-Personal')).toBeInTheDocument()
      expect(screen.getByTestId('item-Theirs')).toHaveAttribute(
        'data-owner',
        'other@tutu.fr'
      )
      expect(screen.getByTestId('item-Holidays')).toBeInTheDocument()
      expect(screen.getAllByTestId('separator')).toHaveLength(2)
    })

    it('hides the section labels and the add buttons', () => {
      renderRail([personal, shared, subscription])

      expect(screen.queryByTestId('group-label')).not.toBeInTheDocument()
      expect(screen.queryByTestId('add-calendar')).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('add-external-calendar')
      ).not.toBeInTheDocument()
      expect(
        screen.queryByTestId('subscribe-shared-calendar')
      ).not.toBeInTheDocument()
    })

    it('skips the line of an empty section', () => {
      renderRail([personal, subscription])

      expect(screen.getAllByTestId('separator')).toHaveLength(1)
    })

    it('draws no line with a single section', () => {
      renderRail([personal])

      expect(screen.queryByTestId('separator')).not.toBeInTheDocument()
    })

    it('keeps the full sidebar on mobile', () => {
      jest.mocked(useSidebar).mockReturnValue({
        state: 'collapsed',
        isMobile: true,
      } as unknown as ReturnType<typeof useSidebar>)

      renderRail([personal, shared, subscription])

      expect(screen.getByText('sidebar.personals.string')).toBeInTheDocument()
      expect(screen.queryByTestId('separator')).not.toBeInTheDocument()
    })
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

    it('keeps the calendars, and their dialogs, mounted while refetching', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: mockData,
        isFetching: true,
      })
      render(<Sidebar />)
      expect(screen.queryByTestId('sidebar-skeleton')).not.toBeInTheDocument()
      expect(screen.getByText('sidebar.personals.string')).toBeInTheDocument()
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

    it('shows the subscribe action next to the shared calendars label', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: mockData,
        isFetching: false,
      })
      render(<Sidebar />)
      const group = screen
        .getByTestId('subscribe-shared-calendar')
        .closest('[data-testid="group"]')
      expect(
        group?.querySelector('[data-testid="group-label"]')?.textContent
      ).toBe('sidebar.shared.string')
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

    it('sorts shared calendars by owner email, then by name', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [
          {
            key: 'z',
            name: 'Alpha',
            source_type: 'local',
            owner: 'zoe@tutu.fr',
          },
          {
            key: 'bw',
            name: 'Work',
            source_type: 'local',
            owner: 'bob@tutu.fr',
          },
          {
            key: 'ba',
            name: 'agenda',
            source_type: 'local',
            owner: 'Bob@tutu.fr',
          },
          {
            key: 'a',
            name: 'Zeta',
            source_type: 'local',
            owner: 'alice@tutu.fr',
          },
        ],
        isFetching: false,
      })
      render(<Sidebar />)
      const names = screen
        .getAllByTestId(/^item-/)
        .map((item) => item.dataset.testid)
      expect(names).toEqual([
        'item-Zeta',
        'item-agenda',
        'item-Work',
        'item-Alpha',
      ])
    })
  })
})
