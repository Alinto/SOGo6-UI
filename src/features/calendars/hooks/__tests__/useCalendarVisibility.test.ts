import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'

const mockUpdateVisibility = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

const mockGetCalendarsQuery = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: () => mockGetCalendarsQuery(),
  useUpdateCalendarVisibilityMutation: () => [mockUpdateVisibility],
}))

import { useCalendarVisibility } from '../useCalendarVisibility'

describe('useCalendarVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isCalendarVisible', () => {
    it('returns true when calendar is not hidden', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [
          { id: 'a', key: 'a', name: 'A', description: null, u_hidden: false },
        ],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(true)
    })

    it('returns false when u_hidden is true', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [
          { id: 'a', key: 'a', name: 'A', description: null, u_hidden: true },
        ],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(false)
    })
  })

  describe('setCalendarVisibility', () => {
    it('maps visible flag to hidden for the mutation', async () => {
      mockGetCalendarsQuery.mockReturnValue({ data: [] })
      const { result } = renderHook(() => useCalendarVisibility())
      await act(async () => {
        await result.current.setCalendarVisibility('x', true)
      })
      expect(mockUpdateVisibility).toHaveBeenCalledWith({
        id: 'x',
        hidden: false,
      })
    })
  })
})
