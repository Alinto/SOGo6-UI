import { createEventFormSchema } from '../event-form'

const t = (key: string) => key

const validBase = {
  calendar_key: 'cal-1',
  title: 'Meeting',
  start: '2024-07-15T10:00',
  end: '2024-07-15T11:00',
  all_day: false,
  timezone: 'UTC',
  visibility: 'public' as const,
  show_as: 'busy' as const,
  status: 'confirmed' as const,
  url: '',
  categories: [],
  reminders: [],
  attendees: [],
  recurrence_rule: null,
}

describe('createEventFormSchema', () => {
  const schema = createEventFormSchema(t)

  it('accepts end on or after start', () => {
    expect(schema.safeParse(validBase).success).toBe(true)
    expect(
      schema.safeParse({
        ...validBase,
        end: '2024-07-15T10:00',
      }).success
    ).toBe(true)
  })

  it('rejects end before start for timed events', () => {
    const result = schema.safeParse({
      ...validBase,
      end: '2024-07-15T09:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['end'])
      expect(result.error.issues[0]?.message).toBe(
        'eventForm.errors.date_order.string'
      )
    }
  })

  it('rejects end before start for all-day events', () => {
    const result = schema.safeParse({
      ...validBase,
      all_day: true,
      start: '2024-07-16',
      end: '2024-07-15',
    })
    expect(result.success).toBe(false)
  })
})
