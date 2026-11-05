import '@testing-library/jest-dom'
import { act, renderHook } from '@testing-library/react'

const mockUpdateFolderPreferences = jest.fn(() => Promise.resolve())
const mockGetCalendarsQuery = jest.fn()
const mockGetFolderPreferencesQuery = jest.fn()

jest.mock('@/features/calendars/store/calendars-api', () => ({
  useGetCalendarsQuery: () => mockGetCalendarsQuery(),
  useGetFolderPreferencesQuery: () => mockGetFolderPreferencesQuery(),
  useUpdateFolderPreferencesMutation: () => [mockUpdateFolderPreferences],
}))

jest.mock('@/hooks/use-is-other-owner', () => ({
  useIsOtherOwner: () => (owner?: string | null) =>
    Boolean(owner) && owner !== 'me@example.com',
}))

import { useCalendarVisibility } from '../useCalendarVisibility'

const calendar = (key: string, extra: Record<string, unknown> = {}) => ({
  id: key,
  key,
  name: key,
  description: null,
  ...extra,
})

describe('useCalendarVisibility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetCalendarsQuery.mockReturnValue({
      data: [calendar('a'), calendar('b'), calendar('c')],
    })
    mockGetFolderPreferencesQuery.mockReturnValue({ data: undefined })
  })

  describe('isCalendarVisible', () => {
    it('returns true when the calendar is missing from the preferences', () => {
      mockGetFolderPreferencesQuery.mockReturnValue({ data: { CALENDAR: {} } })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(true)
    })

    it('returns true while the preferences are loading', () => {
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(true)
    })

    it('reads display from OWNER and SUBS', () => {
      mockGetFolderPreferencesQuery.mockReturnValue({
        data: {
          CALENDAR: {
            OWNER: { a: { display: false }, b: { display: true } },
            SUBS: { c: { display: false } },
          },
        },
      })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(false)
      expect(result.current.isCalendarVisible('b')).toBe(true)
      expect(result.current.isCalendarVisible('c')).toBe(false)
    })

    it('returns false for a calendar no longer in the list (unsubscribed)', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [{ id: 'a', key: 'a', name: 'A', description: null }],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('shared-cal-1')).toBe(false)
    })

    it('matches a calendar by id when its key differs', () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [{ id: 'a-id', key: 'a-key', name: 'A', description: null }],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a-id')).toBe(true)
      expect(result.current.isCalendarVisible('a-key')).toBe(true)
    })

    it('returns true while the calendars are not loaded', () => {
      mockGetCalendarsQuery.mockReturnValue({ data: undefined })
      const { result } = renderHook(() => useCalendarVisibility())
      expect(result.current.isCalendarVisible('a')).toBe(true)
    })
  })

  describe('setCalendarVisibility', () => {
    it('patches a personal calendar in OWNER', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [calendar('perso', { source_type: 'local' })],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      await act(async () => {
        await result.current.setCalendarVisibility('perso', false)
      })
      expect(mockUpdateFolderPreferences).toHaveBeenCalledWith({
        CALENDAR: { OWNER: { perso: { display: false } } },
      })
    })

    it('patches a shared calendar in SUBS', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [calendar('shared', { owner: 'other@example.com' })],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      await act(async () => {
        await result.current.setCalendarVisibility('shared', true)
      })
      expect(mockUpdateFolderPreferences).toHaveBeenCalledWith({
        CALENDAR: { SUBS: { shared: { display: true } } },
      })
    })

    it('patches a subscription calendar in SUBS', async () => {
      mockGetCalendarsQuery.mockReturnValue({
        data: [calendar('ics', { source_type: 'ics' })],
      })
      const { result } = renderHook(() => useCalendarVisibility())
      await act(async () => {
        await result.current.setCalendarVisibility('ics', false)
      })
      expect(mockUpdateFolderPreferences).toHaveBeenCalledWith({
        CALENDAR: { SUBS: { ics: { display: false } } },
      })
    })
  })
})
