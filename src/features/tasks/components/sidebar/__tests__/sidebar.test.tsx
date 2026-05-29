import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (s: unknown) => unknown) =>
    selector({
      tasksUi: {
        statusFilter: 'all',
        selectedCalendarKey: null,
      },
    }),
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
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
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

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="badge">{children}</span>
  ),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { useGetCalendarsQuery } from '@/features/calendars'
import { useTasksSource } from '../../../hooks/use-tasks-source'
import { setStatusFilter } from '../../../store/tasks-ui-slice'
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
      expect(screen.getByText('sidebar.smart_views.all.string')).toBeInTheDocument()
      expect(screen.getByText('sidebar.calendars.title.string')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('dispatches setStatusFilter when smart view is clicked', async () => {
      const user = userEvent.setup()
      render(<TasksSidebar />)
      await user.click(screen.getByText('sidebar.smart_views.today.string'))
      expect(mockDispatch).toHaveBeenCalledWith(setStatusFilter('today'))
    })
  })
})
