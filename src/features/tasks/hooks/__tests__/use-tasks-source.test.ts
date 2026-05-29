import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import { skipToken } from '@reduxjs/toolkit/query'

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn(),
}))

jest.mock('../../store/tasks-api', () => ({
  useGetTasksQuery: jest.fn(),
  useGetCalendarTasksQuery: jest.fn(),
}))

import { useAppSelector } from '@/lib/redux/hooks'
import {
  useGetCalendarTasksQuery,
  useGetTasksQuery,
} from '../../store/tasks-api'
import { useTasksSource } from '../use-tasks-source'

const mockUseAppSelector = useAppSelector as jest.Mock
const mockUseGetTasksQuery = useGetTasksQuery as jest.Mock
const mockUseGetCalendarTasksQuery = useGetCalendarTasksQuery as jest.Mock

describe('useTasksSource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAppSelector.mockReturnValue({
      selectedCalendarKey: null,
      searchQuery: '',
    })
    mockUseGetTasksQuery.mockReturnValue({
      data: [{ id: 't1', title: 'Global' }],
      isLoading: false,
      isFetching: false,
    })
    mockUseGetCalendarTasksQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetching: false,
    })
  })

  describe('configuration', () => {
    it('uses global query when no calendar is selected', () => {
      const { result } = renderHook(() => useTasksSource())
      expect(mockUseGetTasksQuery).toHaveBeenCalledWith({ search: undefined })
      expect(mockUseGetCalendarTasksQuery).toHaveBeenCalledWith(skipToken)
      expect(result.current.tasks).toEqual([{ id: 't1', title: 'Global' }])
    })

    it('uses calendar query when calendar is selected', () => {
      mockUseAppSelector.mockReturnValue({
        selectedCalendarKey: 'cal-1',
        searchQuery: 'ab',
      })
      mockUseGetCalendarTasksQuery.mockReturnValue({
        data: [{ id: 't2', title: 'Cal task' }],
        isLoading: true,
        isFetching: true,
      })
      const { result } = renderHook(() => useTasksSource())
      expect(mockUseGetTasksQuery).toHaveBeenCalledWith(skipToken)
      expect(mockUseGetCalendarTasksQuery).toHaveBeenCalledWith({
        calendarKey: 'cal-1',
        params: { search: 'ab' },
      })
      expect(result.current.tasks).toEqual([{ id: 't2', title: 'Cal task' }])
      expect(result.current.isLoading).toBe(true)
      expect(result.current.selectedCalendarKey).toBe('cal-1')
    })

    it('passes search param when query length is at least 2', () => {
      mockUseAppSelector.mockReturnValue({
        selectedCalendarKey: null,
        searchQuery: '  hello  ',
      })
      renderHook(() => useTasksSource())
      expect(mockUseGetTasksQuery).toHaveBeenCalledWith({ search: 'hello' })
    })
  })
})
