import { schema } from '../edit-schema'

describe('edit-schema', () => {
  it('should export a schema', () => {
    expect(schema).toBeDefined()
  })

  it('should validate valid calendar edit data', () => {
    const validData = {
      id: '123',
      name: 'Test Calendar',
      color: '#3b82f6',
      description: 'Test description',
      eventDuration: '30 minutes',
      showBusyStatus: false,
    }

    const result = schema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should require id field', () => {
    const invalidData = {
      name: 'Test Calendar',
      color: '#3b82f6',
      eventDuration: '30 minutes',
      showBusyStatus: false,
    }

    const result = schema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })

  it('should reject invalid color format', () => {
    const invalidData = {
      id: '123',
      name: 'Test Calendar',
      color: 'invalid-color',
      eventDuration: '30 minutes',
      showBusyStatus: false,
    }

    const result = schema.safeParse(invalidData)
    expect(result.success).toBe(false)
  })
})
