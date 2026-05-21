import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Views } from 'react-big-calendar'

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: jest.fn(),
  useGetEventsInTimeRangeQuery: jest.fn(),
  useCreateCalendarEventMutation: jest.fn(() => [jest.fn()]),
  useUpdateCalendarEventMutation: jest.fn(() => [jest.fn()]),
  useDeleteCalendarEventMutation: jest.fn(() => [jest.fn()]),
}))

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

import {
  useGetCalendarsQuery,
  useGetEventsInTimeRangeQuery,
} from '@/features/calendars'
import { useCalendarState } from '../useCalendarState'

const mockUseGetCalendarsQuery = useGetCalendarsQuery as jest.Mock
const mockUseGetEventsInTimeRangeQuery = useGetEventsInTimeRangeQuery as jest.Mock


describe('useCalendarState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ id: 'k1', key: 'k1', name: 'A', description: null }],
    })
    mockUseGetEventsInTimeRangeQuery.mockReturnValue({
      data: undefined,
      currentData: undefined,
      isLoading: false,
    })
  })

  describe('initial state', () => {
    it('defaults to week view', () => {
      const { result } = renderHook(() => useCalendarState())
      expect(result.current.view).toBe(Views.WEEK)
    })

    it('exposes handleNavigate and updates date', () => {
      const { result } = renderHook(() => useCalendarState())
      const next = new Date('2020-01-15T12:00:00Z')
      act(() => {
        result.current.handleNavigate(next)
      })
      expect(result.current.date.getTime()).toBe(next.getTime())
    })
  })

  describe('handleSelectSlot', () => {
    it('records slot selection', () => {
      const { result } = renderHook(() => useCalendarState())
      const slot = {
        start: new Date('2020-01-10T09:00:00Z'),
        end: new Date('2020-01-10T10:00:00Z'),
        slots: [],
        action: 'click' as const,
      }
      act(() => {
        result.current.handleSelectSlot(slot)
      })
      expect(result.current.selectedSlot).toEqual(slot)
    })
  })

  describe('events from query', () => {
    it('maps fetched events when calendars and data exist', async () => {
      mockUseGetCalendarsQuery.mockReturnValue({
        data: [{ id: 'k1', key: 'k1', name: 'A', description: null }],
      })
      mockUseGetEventsInTimeRangeQuery.mockReturnValue({
        data: [
          {
            id: 'e1',
            calendar_id: 'k1',
            title: 'E',
            all_day: false,
            start_date: '2020-01-10T10:00:00.000Z',
            end_date: '2020-01-10T11:00:00.000Z',
            date_start: '2020-01-10T10:00:00.000Z',
            date_end: '2020-01-10T11:00:00.000Z',
            created_at: '2020-01-01T00:00:00.000Z',
            updated_at: '2020-01-01T00:00:00.000Z',
          },
        ],
        currentData: [
          {
            id: 'e1',
            calendar_id: 'k1',
            title: 'E',
            all_day: false,
            start_date: '2020-01-10T10:00:00.000Z',
            end_date: '2020-01-10T11:00:00.000Z',
            date_start: '2020-01-10T10:00:00.000Z',
            date_end: '2020-01-10T11:00:00.000Z',
            created_at: '2020-01-01T00:00:00.000Z',
            updated_at: '2020-01-01T00:00:00.000Z',
          },
        ],
        isLoading: false,
      })
      const { result } = renderHook(() => useCalendarState())
      await waitFor(() => {
        expect(result.current.events.length).toBe(1)
      })
      expect(result.current.events[0].title).toBe('E')
    })
  })

})
