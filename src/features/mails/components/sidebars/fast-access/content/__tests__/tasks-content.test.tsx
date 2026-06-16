import '@testing-library/jest-dom'
import { act, render, screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import TasksContent from '../tasks-content'

const mockUseGetCalendarsQuery = jest.fn()
const mockUseGetTasksQuery = jest.fn()
const mockUpdateTask = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: () => mockUseGetCalendarsQuery(),
}))

jest.mock('@/features/tasks', () => ({
  useGetTasksQuery: (params?: { search?: string }) => mockUseGetTasksQuery(params),
  useUpdateTaskMutation: () => [mockUpdateTask],
}))

jest.mock('@/features/tasks/components/task-complete-checkbox', () => ({
  __esModule: true,
  default: ({
    label,
    onToggle,
  }: {
    label: string
    onToggle: () => Promise<void>
  }) => (
    <button type="button" aria-label={label} onClick={() => void onToggle()}>
      complete
    </button>
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarGroupContent: ({
    children,
    className,
    ...props
  }: {
    children: ReactNode
    className?: string
  }) => (
    <div data-testid="sidebar-group-content" className={className} {...props}>
      {children}
    </div>
  ),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    asChild,
  }: {
    children: ReactNode
    asChild?: boolean
  }) => (asChild ? children : <button type="button">{children}</button>),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} />
  ),
}))

jest.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}))

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode
    href: string
  }) => <a href={href}>{children}</a>,
}))

jest.mock('@/lib/utils', () => ({
  cn: (...args: (string | boolean | undefined)[]) =>
    args.filter(Boolean).join(' '),
}))

jest.mock('next-intl', () => ({
  useTranslations: (ns: string) => (key: string) => {
    if (ns === 'TASKS') {
      const tasksMap: Record<string, string> = {
        'overdue.string': 'Overdue',
        'priority.high.string': 'High',
      }
      return tasksMap[key] ?? key
    }
    const map: Record<string, string> = {
      title: 'Tasks',
      view_all: 'View all tasks',
      overdue: 'Overdue',
      today: 'Today',
      upcoming: 'Upcoming',
      no_due_date: 'No due date',
      empty: "You're all caught up",
      no_results: 'No matches',
      search_placeholder: 'Search tasks',
      loading: 'Loading tasks…',
      error: 'Could not load tasks',
    }
    return map[key] ?? key
  },
}))

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

function daysAgo(days: number): string {
  return daysFromNow(-days)
}

describe('TasksContent', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateTask.mockReturnValue({ unwrap: () => Promise.resolve({}) })
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ id: 'cal-1', key: 'cal-1', color: '#3b82f6' }],
    })
    mockUseGetTasksQuery.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    })
  })

  describe('basic rendering', () => {
    it('renders panel header and view all link', () => {
      render(<TasksContent />)
      expect(screen.getByTestId('tasks-panel')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: 'View all tasks' })).toHaveAttribute(
        'href',
        '/tasks'
      )
    })

    it('does not render calendar widget', () => {
      render(<TasksContent />)
      expect(screen.queryByTestId('mock-calendar')).not.toBeInTheDocument()
    })

    it('shows empty state when no active tasks', () => {
      render(<TasksContent />)
      expect(screen.getByText("You're all caught up")).toBeInTheDocument()
    })

    it('renders search input when tasks are loaded', () => {
      render(<TasksContent />)
      expect(screen.getByTestId('fast-access-tasks-search')).toBeInTheDocument()
    })
  })

  describe('smart sections', () => {
    it('renders overdue section with destructive count', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 't1',
            id: 't1',
            title: 'Late task',
            status: 'needs_action',
            due: daysAgo(2),
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      const section = screen.getByTestId('task-section-overdue')
      expect(within(section).getByText('Late task')).toBeInTheDocument()
      expect(within(section).getByText('1')).toBeInTheDocument()
    })

    it('renders today section for tasks due today', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 't2',
            id: 't2',
            title: 'Due today',
            status: 'needs_action',
            due: daysFromNow(0),
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      expect(screen.getByTestId('task-section-today')).toBeInTheDocument()
      expect(screen.getByText('Due today')).toBeInTheDocument()
    })

    it('renders upcoming section', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 't3',
            id: 't3',
            title: 'Next week',
            status: 'needs_action',
            due: daysFromNow(3),
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      expect(screen.getByTestId('task-section-upcoming')).toBeInTheDocument()
      expect(screen.getByText('Next week')).toBeInTheDocument()
    })

    it('excludes completed tasks from all sections', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 'done',
            id: 'done',
            title: 'Done task',
            status: 'completed',
            due: daysAgo(1),
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      expect(screen.queryByText('Done task')).not.toBeInTheDocument()
      expect(screen.getByText("You're all caught up")).toBeInTheDocument()
    })

    it('shows undated section expanded when tasks have no due', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 'u1',
            id: 'u1',
            title: 'Backlog',
            status: 'needs_action',
            due: null,
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      expect(screen.getByTestId('task-section-undated')).toBeInTheDocument()
      expect(screen.getByText('Backlog')).toBeInTheDocument()
    })
  })

  describe('search', () => {
    const allTasks = [
      {
        key: 't1',
        id: 't1',
        title: 'Buy groceries',
        status: 'needs_action' as const,
        due: daysFromNow(0),
      },
      {
        key: 't2',
        id: 't2',
        title: 'Write report',
        status: 'needs_action' as const,
        due: daysFromNow(1),
      },
    ]

    beforeEach(() => {
      jest.useFakeTimers()
      mockUseGetTasksQuery.mockImplementation((params?: { search?: string }) => {
        const query = params?.search?.toLowerCase()
        const data =
          query && query.length >= 2
            ? allTasks.filter((task) => task.title.toLowerCase().includes(query))
            : allTasks

        return {
          data,
          isLoading: false,
          isError: false,
        }
      })
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('queries the API with search after debounce', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimers,
      })

      render(<TasksContent />)
      await user.type(screen.getByTestId('fast-access-tasks-search'), 'report')

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(mockUseGetTasksQuery).toHaveBeenCalledWith({ search: 'report' })
      })
      expect(screen.queryByText('Buy groceries')).not.toBeInTheDocument()
      expect(screen.getByText('Write report')).toBeInTheDocument()
    })

    it('shows no results message when search matches nothing', async () => {
      const user = userEvent.setup({
        advanceTimers: jest.advanceTimers,
      })

      render(<TasksContent />)
      await user.type(screen.getByTestId('fast-access-tasks-search'), 'zzzz')

      await act(async () => {
        jest.advanceTimersByTime(300)
      })

      await waitFor(() => {
        expect(screen.getByText('No matches')).toBeInTheDocument()
      })
    })
  })

  describe('complete action', () => {
    it('calls updateTask when completing from checkbox', async () => {
      const user = userEvent.setup()
      mockUseGetTasksQuery.mockReturnValue({
        data: [
          {
            key: 't1',
            id: 't1',
            title: 'Complete me',
            status: 'needs_action',
            due: daysFromNow(0),
          },
        ],
        isLoading: false,
        isError: false,
      })

      render(<TasksContent />)
      await user.click(screen.getByRole('button', { name: 'Complete me' }))

      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskKey: 't1',
          body: expect.objectContaining({ status: 'completed' }),
          silentSuccess: true,
        })
      )
    })
  })

  describe('states', () => {
    it('shows loading message', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      })

      render(<TasksContent />)
      expect(screen.getByText('Loading tasks…')).toBeInTheDocument()
    })

    it('shows error message', () => {
      mockUseGetTasksQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
      })

      render(<TasksContent />)
      expect(screen.getByText('Could not load tasks')).toBeInTheDocument()
    })
  })
})
