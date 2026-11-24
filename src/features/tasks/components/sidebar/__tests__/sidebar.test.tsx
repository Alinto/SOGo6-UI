import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()

const mockTasksUiState = {
  statusFilter: 'all' as const,
  selectedCalendarKey: null as string | null,
}

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({ tasksUi: mockTasksUiState }),
}))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: jest.fn(),
}))

jest.mock('../../../hooks/use-tasks-source', () => ({
  useTasksSource: jest.fn(),
}))

jest.mock('../create-task-opener', () => ({
  __esModule: true,
  default: () => <div data-testid="create-task-opener" />,
}))

jest.mock('../skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-sidebar-skeleton" />,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroup: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sidebar-group">{children}</div>
  ),
  SidebarGroupLabel: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
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
  SidebarSeparator: () => <hr data-testid="separator" />,
  useSidebar: jest.fn(),
}))

let mockRailHeight: number | null = null

jest.mock('@/hooks/use-element-height', () => ({
  useElementHeight: () => ({ ref: jest.fn(), height: mockRailHeight }),
}))

jest.mock('@/components/sidebar/rail-more-button', () => ({
  __esModule: true,
  default: ({ label, count }: { label: string; count: number }) => (
    <li data-testid="rail-more" data-label={label} data-count={count} />
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import {
  RAIL_GAP,
  RAIL_ROW_HEIGHT,
  RAIL_SEPARATOR_HEIGHT,
} from '@/components/sidebar/fit-rail-sections'
import { useSidebar } from '@/components/ui/sidebar'
import { useGetCalendarsQuery } from '@/features/calendars'
import { useTasksSource } from '../../../hooks/use-tasks-source'
import {
  setCalendarFilter,
  setStatusFilter,
} from '../../../store/tasks-ui-slice'
import TasksSidebar from '../sidebar'

const mockUseGetCalendarsQuery = useGetCalendarsQuery as jest.Mock
const mockUseTasksSource = useTasksSource as jest.Mock

const sampleTasks = [
  {
    id: 't1',
    key: 't1',
    title: 'Today task',
    status: 'needs_action' as const,
    due: new Date().toISOString(),
  },
  {
    id: 't2',
    key: 't2',
    title: 'Overdue',
    status: 'needs_action' as const,
    due: '2020-01-01T00:00:00.000Z',
  },
]

describe('TasksSidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRailHeight = null
    jest.mocked(useSidebar).mockReturnValue({
      state: 'expanded',
    } as ReturnType<typeof useSidebar>)
    mockTasksUiState.statusFilter = 'all'
    mockTasksUiState.selectedCalendarKey = null
    mockUseTasksSource.mockReturnValue({
      tasks: sampleTasks,
      isLoading: false,
    })
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ key: 'cal-1', id: 'cal-1', name: 'Personal', color: '#111' }],
      isLoading: false,
    })
  })

  describe('configuration', () => {
    it('shows skeleton while loading', () => {
      mockUseTasksSource.mockReturnValue({ tasks: undefined, isLoading: true })
      mockUseGetCalendarsQuery.mockReturnValue({ data: [], isLoading: true })
      render(<TasksSidebar />)
      expect(screen.getByTestId('tasks-sidebar-skeleton')).toBeInTheDocument()
    })
  })

  describe('basic rendering', () => {
    it('renders smart views and create opener', async () => {
      render(<TasksSidebar />)
      await waitFor(() => {
        expect(screen.getByTestId('create-task-opener')).toBeInTheDocument()
      })
      expect(
        screen.getByText('sidebar.smart_views.all.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.calendars.title.string')
      ).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
      expect(
        screen.getByText('sidebar.calendars.all.string')
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('dispatches setStatusFilter when smart view is clicked', async () => {
      const user = userEvent.setup()
      render(<TasksSidebar />)
      await user.click(screen.getByText('sidebar.smart_views.today.string'))
      expect(mockDispatch).toHaveBeenCalledWith(setStatusFilter('today'))
    })

    it('dispatches setCalendarFilter(null) when all calendars is clicked', async () => {
      const user = userEvent.setup()
      render(<TasksSidebar />)
      await user.click(screen.getByText('sidebar.calendars.all.string'))
      expect(mockDispatch).toHaveBeenCalledWith(setCalendarFilter(null))
    })

    it('toggles calendar filter off when the same calendar is clicked again', async () => {
      const user = userEvent.setup()
      mockTasksUiState.selectedCalendarKey = 'cal-1'
      render(<TasksSidebar />)
      await user.click(screen.getByText('Personal'))
      expect(mockDispatch).toHaveBeenCalledWith(setCalendarFilter(null))
    })
  })
  describe('icon rail (collapsed sidebar)', () => {
    const calendars = [
      { key: 'cal-1', id: 'cal-1', name: 'Personal', color: '#111' },
      { key: 'cal-2', id: 'cal-2', name: 'Work', color: '#222' },
      { key: 'cal-3', id: 'cal-3', name: 'Family', color: '#333' },
    ]
    /** Room for `rows` rows, the line between the two sections included. */
    const roomFor = (rows: number) =>
      rows * RAIL_ROW_HEIGHT +
      (rows - 1) * RAIL_GAP +
      RAIL_SEPARATOR_HEIGHT +
      RAIL_GAP

    beforeEach(() => {
      jest.mocked(useSidebar).mockReturnValue({
        state: 'collapsed',
      } as ReturnType<typeof useSidebar>)
      mockUseGetCalendarsQuery.mockReturnValue({
        data: calendars,
        isLoading: false,
      })
    })

    it('shows everything, with a line between views and calendars, when it fits', () => {
      mockRailHeight = 2000

      render(<TasksSidebar />)

      expect(
        screen.getByText('sidebar.smart_views.all.string')
      ).toBeInTheDocument()
      expect(screen.getByText('Family')).toBeInTheDocument()
      expect(screen.getAllByTestId('separator')).toHaveLength(1)
      expect(screen.queryByTestId('rail-more')).not.toBeInTheDocument()
      expect(
        screen.queryByText('sidebar.smart_views.title.string')
      ).not.toBeInTheDocument()
    })

    it('limits the entries to the room above the footer, then shows "+N"', () => {
      // 5 views + "all calendars" + 1 calendar + the "+N" row.
      mockRailHeight = roomFor(8)

      render(<TasksSidebar />)

      expect(
        screen.getByText('sidebar.calendars.all.string')
      ).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
      expect(screen.queryByText('Work')).not.toBeInTheDocument()
      expect(screen.queryByText('Family')).not.toBeInTheDocument()
      expect(screen.getByTestId('rail-more')).toHaveAttribute('data-count', '2')
      expect(screen.getByTestId('rail-more')).toHaveAttribute(
        'data-label',
        'sidebar.railMore.string'
      )
    })

    it('keeps the full sidebar on mobile', () => {
      jest.mocked(useSidebar).mockReturnValue({
        state: 'collapsed',
        isMobile: true,
      } as unknown as ReturnType<typeof useSidebar>)
      mockRailHeight = roomFor(2)

      render(<TasksSidebar />)

      expect(
        screen.getByText('sidebar.smart_views.title.string')
      ).toBeInTheDocument()
      expect(screen.getByText('Family')).toBeInTheDocument()
      expect(screen.queryByTestId('rail-more')).not.toBeInTheDocument()
    })
  })
})
