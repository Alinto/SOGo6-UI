import '@testing-library/jest-dom'
import { act, renderHook, waitFor } from '@testing-library/react'
import { Views } from 'react-big-calendar'

const mockUpdateCalendarEvent = jest.fn(() => Promise.resolve({ data: {} }))

jest.mock('@/features/calendars', () => ({
  useGetCalendarsQuery: jest.fn(),
  useGetEventsQuery: jest.fn(),
  useCreateCalendarEventMutation: jest.fn(() => [jest.fn()]),
  useUpdateCalendarEventMutation: jest.fn(() => [mockUpdateCalendarEvent]),
  useDeleteCalendarEventMutation: jest.fn(() => [jest.fn()]),
}))

jest.mock('next-intl', () => ({
  useLocale: () => 'en',
}))

import { useGetCalendarsQuery, useGetEventsQuery } from '@/features/calendars'
import { useCalendarState } from '../useCalendarState'

const mockUseGetCalendarsQuery = useGetCalendarsQuery as jest.Mock
const mockUseGetEventsQuery = useGetEventsQuery as jest.Mock

describe('useCalendarState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseGetCalendarsQuery.mockReturnValue({
      data: [{ id: 'k1', key: 'k1', name: 'A', description: null }],
    })
    mockUseGetEventsQuery.mockReturnValue({
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
      mockUseGetEventsQuery.mockReturnValue({
        data: [
          {
            id: 'e1',
            calendar_id: 'k1',
            title: 'E',
            all_day: false,
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

  describe('handleEventDrop', () => {
    it('optimistically moves the event and PATCHes with silentSuccess', async () => {
      mockUseGetEventsQuery.mockReturnValue({
        currentData: [
          {
            id: 'e1',
            key: 'e1',
            calendar_id: 'k1',
            title: 'E',
            all_day: false,
            date_start: '2020-01-10T10:00:00.000Z',
            date_end: '2020-01-10T11:00:00.000Z',
          },
        ],
        isLoading: false,
      })

      const { result } = renderHook(() => useCalendarState())
      await waitFor(() => {
        expect(result.current.events).toHaveLength(1)
      })

      const nextStart = new Date('2020-01-11T10:00:00.000Z')
      const nextEnd = new Date('2020-01-11T11:00:00.000Z')

      act(() => {
        result.current.handleEventDrop({
          event: result.current.events[0],
          start: nextStart,
          end: nextEnd,
          isAllDay: false,
        } as Parameters<typeof result.current.handleEventDrop>[0])
      })

      expect(result.current.events[0].date_start).toBe(nextStart.toISOString())
      expect(mockUpdateCalendarEvent).toHaveBeenCalledWith({
        eventKey: 'e1',
        body: expect.objectContaining({
          date_start: nextStart.toISOString(),
          date_end: nextEnd.toISOString(),
          all_day: false,
        }),
        silentSuccess: true,
      })
    })
  })
})
