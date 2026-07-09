import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'

const mockDispatch = jest.fn()
const mockUpdateTask = jest.fn()
const mockDeleteTask = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: jest.fn(),
}))

jest.mock('../../store/tasks-api', () => ({
  useUpdateTaskMutation: jest.fn(() => [mockUpdateTask]),
  useDeleteTaskMutation: jest.fn(() => [mockDeleteTask]),
}))

import { useAppSelector } from '@/lib/redux/hooks'
import { useTaskSelection } from '../use-task-selection'

const mockUseAppSelector = useAppSelector as jest.Mock

const tasks = [
  { id: 't1', key: 't1', title: 'Open', status: 'needs_action' as const },
  { id: 't2', key: 't2', title: 'Done', status: 'completed' as const },
]

describe('useTaskSelection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppSelector.mockReturnValue({
      selectionMode: false,
      selectedTaskKeys: [],
    })
    mockUpdateTask.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    })
    mockDeleteTask.mockReturnValue({
      unwrap: jest.fn().mockResolvedValue({}),
    })
  })

  describe('selection flags', () => {
    it('reports allSelected when every visible task is selected', () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t1', 't2'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      expect(result.current.allSelected).toBe(true)
      expect(result.current.someSelected).toBe(false)
    })

    it('reports someSelected for a partial selection', () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t1'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      expect(result.current.allSelected).toBe(false)
      expect(result.current.someSelected).toBe(true)
    })

    it('sets bulkActionIsReopen when all selected tasks are completed', () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t2'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      expect(result.current.bulkActionIsReopen).toBe(true)
    })
  })

  describe('dispatch handlers', () => {
    it('enters and exits selection mode', () => {
      const { result } = renderHook(() => useTaskSelection(tasks))

      act(() => {
        result.current.handleEnterSelectionMode()
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('enterSelectionMode') })
      )

      act(() => {
        result.current.handleExitSelectionMode()
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('exitSelectionMode') })
      )
    })

    it('selects all visible tasks when checked', () => {
      const { result } = renderHook(() => useTaskSelection(tasks))

      act(() => {
        result.current.handleSelectAll(true)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('setSelectedTaskKeys'),
          payload: ['t1', 't2'],
        })
      )
    })

    it('clears selection when select-all is unchecked', () => {
      const { result } = renderHook(() => useTaskSelection(tasks))

      act(() => {
        result.current.handleSelectAll(false)
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('setSelectedTaskKeys'),
          payload: [],
        })
      )
    })

    it('toggles a single task key', () => {
      const { result } = renderHook(() => useTaskSelection(tasks))

      act(() => {
        result.current.handleToggleTaskSelection('t1')
      })

      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining('toggleTaskSelection'),
          payload: 't1',
        })
      )
    })
  })

  describe('bulk actions', () => {
    it('completes open tasks and exits selection mode', async () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t1'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      await act(async () => {
        await result.current.handleBulkComplete()
      })

      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskKey: 't1',
          body: expect.objectContaining({ status: 'completed' }),
          silentSuccess: true,
        })
      )
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('exitSelectionMode') })
      )
    })

    it('reopens completed tasks when bulkActionIsReopen', async () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t2'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      await act(async () => {
        await result.current.handleBulkComplete()
      })

      expect(mockUpdateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          taskKey: 't2',
          body: expect.objectContaining({ status: 'needs_action' }),
          silentSuccess: true,
        })
      )
    })

    it('deletes selected tasks and exits selection mode', async () => {
      mockUseAppSelector.mockReturnValue({
        selectionMode: true,
        selectedTaskKeys: ['t1', 't2'],
      })

      const { result } = renderHook(() => useTaskSelection(tasks))

      await act(async () => {
        await result.current.handleBulkDelete()
      })

      expect(mockDeleteTask).toHaveBeenCalledTimes(2)
      expect(mockDeleteTask).toHaveBeenCalledWith('t1')
      expect(mockDeleteTask).toHaveBeenCalledWith('t2')
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('exitSelectionMode') })
      )
    })
  })
})
