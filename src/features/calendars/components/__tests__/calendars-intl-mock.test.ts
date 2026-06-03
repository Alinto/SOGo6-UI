import '@testing-library/jest-dom'
import { calendarsMessagesT } from '../calendars-intl-mock'

describe('calendarsMessagesT', () => {
  describe('key resolution', () => {
    it('resolves a top-level CALENDARS key', () => {
      expect(calendarsMessagesT('loading.string')).toBe('Loading...')
    })

    it('resolves a nested dotted key', () => {
      expect(calendarsMessagesT('eventForm.attendees.no_data.string')).toBe(
        'No availability data'
      )
    })

    it('returns the key when the path is missing', () => {
      expect(calendarsMessagesT('missing.path.here')).toBe('missing.path.here')
    })
  })

  describe('interpolation', () => {
    it('replaces placeholders with provided values', () => {
      expect(
        calendarsMessagesT('eventForm.attendees.timeline_hour.string', { hour: 14 })
      ).toBe('14h')
    })

    it('returns the raw message when no values are passed', () => {
      expect(calendarsMessagesT('eventForm.attendees.timeline_hour.string')).toBe(
        '{hour}h'
      )
    })

    it('replaces multiple placeholders in one message', () => {
      expect(
        calendarsMessagesT('eventForm.attendees.tooltip_slot_free.string', {
          name: 'Alice',
          time: '10:00',
        })
      ).toBe('Alice · free · 10:00')
    })
  })
})
