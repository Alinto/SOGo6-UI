import { createTaskFormSchema } from '../task-form'

const t = (key: string) => key

const validBase = {
  title: 'Task',
  description: null,
  calendar_key: 'cal-1',
  due: '2024-07-16T17:00',
  date_start: '2024-07-15T09:00',
  status: 'needs_action' as const,
  priority: 0,
  percent_complete: 0,
  visibility: 'public' as const,
}

describe('createTaskFormSchema', () => {
  const schema = createTaskFormSchema(t)

  it('accepts due on or after start when both are set', () => {
    expect(schema.safeParse(validBase).success).toBe(true)
    expect(
      schema.safeParse({
        ...validBase,
        due: '2024-07-15T09:00',
      }).success
    ).toBe(true)
  })

  it('allows missing due or start', () => {
    expect(
      schema.safeParse({ ...validBase, due: '', date_start: '' }).success
    ).toBe(true)
    expect(
      schema.safeParse({ ...validBase, due: null, date_start: null }).success
    ).toBe(true)
    expect(
      schema.safeParse({
        ...validBase,
        due: '2024-07-16T17:00',
        date_start: '',
      }).success
    ).toBe(true)
  })

  it('rejects due before start', () => {
    const result = schema.safeParse({
      ...validBase,
      due: '2024-07-14T17:00',
      date_start: '2024-07-15T09:00',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['due'])
      expect(result.error.issues[0]?.message).toBe(
        'form.errors.date_order.string'
      )
    }
  })
})
