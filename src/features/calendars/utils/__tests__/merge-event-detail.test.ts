import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { mergeEventDetailWithListSelection } from '../merge-event-detail'

const base: CalendarEvent = {
  id: 'master',
  key: 'master',
  calendar_id: 'cal-1',
  title: 'Weekly',
  all_day: false,
  created_at: '',
  updated_at: '',
}

describe('mergeEventDetailWithListSelection', () => {
  it('keeps the clicked occurrence identity over the master detail', () => {
    const occurrence: CalendarEvent = {
      ...base,
      recurrence_id: '2026-12-02T09:00:00.000Z',
      date_start: '2026-12-02T09:00:00.000Z',
      date_end: '2026-12-02T10:00:00.000Z',
    }
    const master: CalendarEvent = {
      ...base,
      title: 'Weekly (detail)',
      recurrence_id: null,
      recurrence_rule: { frequency: 'weekly' },
      date_start: '2026-11-04T09:00:00.000Z',
      date_end: '2026-11-04T10:00:00.000Z',
    }

    const merged = mergeEventDetailWithListSelection(occurrence, master)

    expect(merged.title).toBe('Weekly (detail)')
    expect(merged.recurrence_rule).toEqual({ frequency: 'weekly' })
    expect(merged.recurrence_id).toBe('2026-12-02T09:00:00.000Z')
    expect(merged.date_start).toBe('2026-12-02T09:00:00.000Z')
    expect(merged.date_end).toBe('2026-12-02T10:00:00.000Z')
    expect(merged.series_date_start).toBe('2026-11-04T09:00:00.000Z')
    expect(merged.series_date_end).toBe('2026-11-04T10:00:00.000Z')
  })

  it('lets the detail win for a plain event', () => {
    const merged = mergeEventDetailWithListSelection(
      { ...base, date_start: '2026-12-02T09:00:00.000Z' },
      { ...base, date_start: '2026-12-02T10:00:00.000Z' }
    )
    expect(merged.date_start).toBe('2026-12-02T10:00:00.000Z')
    expect(merged.series_date_start).toBeUndefined()
  })

  it('keeps the list calendar when the detail has none', () => {
    const merged = mergeEventDetailWithListSelection(base, {
      ...base,
      calendar_id: null,
      calendar_key: '',
    })
    expect(merged.calendar_id).toBe('cal-1')
  })
})
