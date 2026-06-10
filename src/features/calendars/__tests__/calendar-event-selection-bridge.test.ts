import '@testing-library/jest-dom'
import type { CalendarEvent } from '@/features/calendars/calendars-types'
import {
  registerCalendarEventSelection,
  selectCalendarEventFromSearch,
} from '../calendar-event-selection-bridge'

const sampleEvent: CalendarEvent = {
  id: 'evt-1',
  key: 'evt-1',
  title: 'Team standup',
  calendar_id: 'cal-1',
  date_start: '2024-06-23T09:00:00.000Z',
}

describe('calendar-event-selection-bridge', () => {
  const unregisterFns: Array<() => void> = []

  afterEach(() => {
    unregisterFns.forEach((unregister) => unregister())
    unregisterFns.length = 0
  })

  describe('selectCalendarEventFromSearch', () => {
    it('does nothing when no handler is registered', () => {
      expect(() => selectCalendarEventFromSearch(sampleEvent)).not.toThrow()
    })
  })

  describe('registerCalendarEventSelection', () => {
    it('forwards selected events to the registered handler', () => {
      const handler = jest.fn()
      unregisterFns.push(registerCalendarEventSelection(handler))

      selectCalendarEventFromSearch(sampleEvent)

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(sampleEvent)
    })

    it('returns unregister that stops forwarding events', () => {
      const handler = jest.fn()
      const unregister = registerCalendarEventSelection(handler)
      unregisterFns.push(unregister)

      selectCalendarEventFromSearch(sampleEvent)
      expect(handler).toHaveBeenCalledTimes(1)

      unregister()
      selectCalendarEventFromSearch(sampleEvent)

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('replaces the previous handler when registering again', () => {
      const firstHandler = jest.fn()
      const secondHandler = jest.fn()

      unregisterFns.push(registerCalendarEventSelection(firstHandler))
      unregisterFns.push(registerCalendarEventSelection(secondHandler))

      selectCalendarEventFromSearch(sampleEvent)

      expect(firstHandler).not.toHaveBeenCalled()
      expect(secondHandler).toHaveBeenCalledWith(sampleEvent)
    })

    it('unregister only clears the handler it registered', () => {
      const firstHandler = jest.fn()
      const secondHandler = jest.fn()

      const unregisterFirst = registerCalendarEventSelection(firstHandler)
      unregisterFns.push(registerCalendarEventSelection(secondHandler))

      unregisterFirst()
      selectCalendarEventFromSearch(sampleEvent)

      expect(firstHandler).not.toHaveBeenCalled()
      expect(secondHandler).toHaveBeenCalledWith(sampleEvent)
    })
  })

  describe('integration', () => {
    it('supports register → select → unregister lifecycle', () => {
      const handler = jest.fn()
      const unregister = registerCalendarEventSelection(handler)

      selectCalendarEventFromSearch(sampleEvent)
      expect(handler).toHaveBeenCalledWith(sampleEvent)

      unregister()
      jest.clearAllMocks()

      selectCalendarEventFromSearch(sampleEvent)
      expect(handler).not.toHaveBeenCalled()
    })
  })
})
