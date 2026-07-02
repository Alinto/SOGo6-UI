import { createEmptyVacation } from '../../mail-vacation-utils'
import { createVacationSchema } from '../vacation-schema'

const t = ((key: string) => key) as Parameters<typeof createVacationSchema>[0]

describe('vacation-schema', () => {
  const schema = createVacationSchema(t)

  it('accepts disabled vacation without message', () => {
    const result = schema.safeParse(createEmptyVacation())
    expect(result.success).toBe(true)
  })

  it('requires message when enabled', () => {
    const values = { ...createEmptyVacation(), enabled: true, autoReplyText: '' }
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
  })

  it('requires dates when date constraints enabled', () => {
    const values = {
      ...createEmptyVacation(),
      enabled: true,
      autoReplyText: 'Away',
      constraints: {
        ...createEmptyVacation().constraints,
        enableDates: true,
        dateRange: null,
      },
    }
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
  })

  it('rejects end date before start date', () => {
    const values = {
      ...createEmptyVacation(),
      enabled: true,
      autoReplyText: 'Away',
      constraints: {
        ...createEmptyVacation().constraints,
        enableDates: true,
        dateRange: {
          from: new Date(2026, 5, 20),
          to: new Date(2026, 5, 15),
        },
      },
    }
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
  })

  it('validates time format when hours enabled', () => {
    const values = {
      ...createEmptyVacation(),
      enabled: true,
      autoReplyText: 'Away',
      constraints: {
        ...createEmptyVacation().constraints,
        enableHours: true,
        startTime: 'invalid',
        endTime: '08:00',
      },
    }
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
  })

  it('requires at least one weekday when weekdays enabled', () => {
    const values = {
      ...createEmptyVacation(),
      enabled: true,
      autoReplyText: 'Away',
      constraints: {
        ...createEmptyVacation().constraints,
        weekdaysEnabled: true,
      },
    }
    const result = schema.safeParse(values)
    expect(result.success).toBe(false)
  })
})
