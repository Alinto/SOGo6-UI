import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
const mockUseTaskState = jest.fn()

jest.mock('../../hooks/use-task-state', () => ({
  useTaskState: () => mockUseTaskState(),
}))

const mockUseTaskSelection = jest.fn()

jest.mock('../../hooks/use-task-selection', () => ({
  useTaskSelection: (...args: unknown[]) => mockUseTaskSelection(...args),
}))

jest.mock('../task-selection-toolbar', () => ({
  __esModule: true,
  default: () => <div data-testid="task-selection-toolbar" />,
}))

const mockUseGetTaskByIdQuery = jest.fn()

jest.mock('../../store/tasks-api', () => ({
  useGetTaskByIdQuery: (...args: unknown[]) => mockUseGetTaskByIdQuery(...args),
}))

jest.mock('../task-list', () => ({
  __esModule: true,
  default: () => <div data-testid="task-list" />,
}))

let lastTaskFormProps: { task: { title?: string } | null } | null = null

jest.mock('../task-form', () => ({
  __esModule: true,
  default: (props: { task: { title?: string } | null }) => {
    lastTaskFormProps = props
    return <div data-testid="task-form" />
  },
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
    open ? <div data-testid="delete-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  AlertDialogCancel: ({ children }: { children: React.ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AlertDialogAction: ({
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

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import TasksPage from '../tasks-page'

describe('TasksPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    lastTaskFormProps = null
    mockUseGetTaskByIdQuery.mockReturnValue({
      data: undefined,
      currentData: undefined,
    })
    mockUseTaskState.mockReturnValue({
      tasks: [],
      isLoading: false,
      calendars: [],
      writableCalendars: [],
        ui: {
          statusFilter: 'all',
          searchQuery: '',
          isFormOpen: false,
          editingTaskKey: null,
          selectedCalendarKey: null,
          selectionMode: false,
          selectedTaskKeys: [],
        },
      handleToggleComplete: jest.fn(),
      createTask: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn().mockReturnValue({ unwrap: jest.fn().mockResolvedValue(undefined) }),
      openCreateForm: jest.fn(),
      openEditForm: jest.fn(),
      closeForm: jest.fn(),
    })
    mockUseTaskSelection.mockReturnValue({
      selectionMode: false,
      selectedTaskKeys: [],
      allSelected: false,
      someSelected: false,
      bulkActionIsReopen: false,
      handleEnterSelectionMode: jest.fn(),
      handleExitSelectionMode: jest.fn(),
      handleToggleTaskSelection: jest.fn(),
      handleSelectAll: jest.fn(),
      handleBulkComplete: jest.fn(),
      handleBulkDelete: jest.fn(),
    })
  })

  describe('basic rendering', () => {
    it('renders page header and list', () => {
      render(<TasksPage />)
      expect(screen.getByTestId('tasks-page')).toBeInTheDocument()
      expect(screen.getByText('page_title.string')).toBeInTheDocument()
      expect(screen.getByTestId('task-list')).toBeInTheDocument()
    })
  })

  describe('task form', () => {
    it('does not pass cached task data when opening create after edit', () => {
      mockUseGetTaskByIdQuery.mockReturnValue({
        data: { title: 'Review quarterly report', key: 'task-1' },
        currentData: undefined,
      })
      mockUseTaskState.mockReturnValue({
        tasks: [],
        isLoading: false,
        calendars: [],
        writableCalendars: [],
        ui: {
          statusFilter: 'all',
          searchQuery: '',
          isFormOpen: true,
          editingTaskKey: null,
          selectedCalendarKey: null,
          selectionMode: false,
          selectedTaskKeys: [],
        },
        handleToggleComplete: jest.fn(),
        createTask: jest.fn(),
        updateTask: jest.fn(),
        deleteTask: jest.fn(),
        openCreateForm: jest.fn(),
        openEditForm: jest.fn(),
        closeForm: jest.fn(),
      })

      render(<TasksPage />)

      expect(lastTaskFormProps?.task).toBeNull()
    })
  })

})
