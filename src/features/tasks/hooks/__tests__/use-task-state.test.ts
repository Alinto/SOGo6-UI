import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockUpdateTask = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: jest.fn(),
}))

jest.mock('@/features/calendars/utils/calendar-source-type', () => ({
  isPersonalCalendar: () => true,
}))

jest.mock('../use-tasks-source', () => ({
  useTasksSource: jest.fn(),
}))

jest.mock('../../store/tasks-api', () => ({
  useCreateTaskMutation: jest.fn(() => [jest.fn()]),
  useUpdateTaskMutation: jest.fn(() => [mockUpdateTask]),
  useDeleteTaskMutation: jest.fn(() => [jest.fn()]),
}))

import { useGetCalendarsQuery } from '@/features/calendars'
import { useAppSelector } from '@/lib/redux/hooks'
import { useTasksSource } from '../use-tasks-source'
import { useTaskState } from '../use-task-state'

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGetCalendarsQuery = useGetCalendarsQuery as jest.Mock
const mockUseTasksSource = useTasksSource as jest.Mock

describe('useTaskState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppSelector.mockReturnValue({
      statusFilter: 'all',
      searchQuery: '',
      selectedCalendarKey: null,
      isFormOpen: false,
      editingTaskKey: null,
    })
    mockUseTasksSource.mockReturnValue({
      tasks: [
        { id: 't1', title: 'Open', status: 'needs_action' },
        { id: 't2', title: 'Done', status: 'completed' },
      ],
      isLoading: false,
      isFetching: false,
    })
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ key: 'cal-1', id: 'cal-1', name: 'Personal', source_type: 'personal' }],
      isLoading: false,
    })
    mockUpdateTask.mockReturnValue({ unwrap: jest.fn().mockResolvedValue({}) })
  })

  describe('initial state', () => {
    it('filters tasks by status filter', () => {
      mockUseAppSelector.mockReturnValue({
        statusFilter: 'completed',
        searchQuery: '',
        selectedCalendarKey: null,
        isFormOpen: false,
        editingTaskKey: null,
      })
      const { result } = renderHook(() => useTaskState())
      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].title).toBe('Done')
    })

    it('exposes writable calendars', () => {
      const { result } = renderHook(() => useTaskState())
      expect(result.current.writableCalendars).toHaveLength(1)
    })
  })

  describe('handleToggleComplete', () => {
    it('updates task to completed', async () => {
      const { result } = renderHook(() => useTaskState())
      await act(async () => {
        await result.current.handleToggleComplete({
          id: 't1',
          key: 't1',
          title: 'Open',
          status: 'needs_action',
        })
      })
      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(
          expect.objectContaining({
            taskKey: 't1',
            body: expect.objectContaining({ status: 'completed' }),
            silentSuccess: true,
          })
        )
      })
    })
  })

  describe('integration', () => {
    it('dispatches openCreateForm', () => {
      const { result } = renderHook(() => useTaskState())
      act(() => {
        result.current.openCreateForm()
      })
      expect(mockDispatch).toHaveBeenCalled()
    })
  })
})
