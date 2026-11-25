import type { CalendarEvent } from '@/features/calendars/calendars-types'
import { planRecurringDelete } from '../recurring-event-delete'

const occurrence: CalendarEvent = {
  id: 'master',
  key: 'master',
  calendar_id: 'cal-1',
  title: 'Weekly',
  all_day: false,
  created_at: '',
  updated_at: '',
  recurrence_rule: { frequency: 'weekly' },
  recurrence_exceptions: ['2026-11-11T09:00:00.000Z'],
  recurrence_id: '2026-12-02T09:00:00.000Z',
  date_start: '2026-12-02T09:00:00.000Z',
  date_end: '2026-12-02T10:00:00.000Z',
  series_date_start: '2026-11-04T09:00:00.000Z',
  series_date_end: '2026-11-04T10:00:00.000Z',
}

describe('planRecurringDelete', () => {
  it('adds only this occurrence to the master EXDATE list', () => {
    expect(planRecurringDelete(occurrence, 'ONE')).toEqual({
      kind: 'patch',
      eventKey: 'master',
      body: {
        recurrence_exceptions: [
          '2026-11-11T09:00:00.000Z',
          '2026-12-02T09:00:00.000Z',
        ],
      },
    })
  })

  it('does not duplicate an occurrence already excluded', () => {
    const plan = planRecurringDelete(
      { ...occurrence, recurrence_exceptions: ['2026-12-02T09:00:00Z'] },
      'ONE'
    )
    expect(plan).toEqual({
      kind: 'patch',
      eventKey: 'master',
      body: { recurrence_exceptions: ['2026-12-02T09:00:00Z'] },
    })
  })

  it('refuses ONE while the master EXDATE list is unknown', () => {
    expect(
      planRecurringDelete(
        { ...occurrence, recurrence_exceptions: undefined },
        'ONE'
      )
    ).toBeNull()
  })

  it('truncates the series from the occurrence for THISANDFUTURE', () => {
    expect(planRecurringDelete(occurrence, 'THISANDFUTURE')).toEqual({
      kind: 'patch',
      eventKey: 'master',
      body: {
        recurrence_id: '2026-12-02T09:00:00.000Z',
        recurrence_range: 'THISANDFUTURE',
      },
    })
  })

  it('deletes the whole series for THISANDFUTURE on the first occurrence', () => {
    expect(
      planRecurringDelete(
        { ...occurrence, recurrence_id: '2026-11-04T09:00:00Z' },
        'THISANDFUTURE'
      )
    ).toEqual({ kind: 'delete', eventKey: 'master' })
  })

  it('deletes the series for ALL', () => {
    expect(planRecurringDelete(occurrence, 'ALL')).toEqual({
      kind: 'delete',
      eventKey: 'master',
    })
  })

  it('deletes a detached occurrence through its own key', () => {
    expect(
      planRecurringDelete(
        {
          ...occurrence,
          key: 'detached',
          recurrence_rule: null,
          recurrence: undefined,
        },
        'ONE'
      )
    ).toEqual({ kind: 'delete', eventKey: 'detached' })
  })
})
