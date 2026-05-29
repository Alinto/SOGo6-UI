import type {
  BaseCalendarFormData,
  CalendarAddFormData,
  CalendarEditFormData,
} from '../calendar-form-types'

describe('calendar-form-types', () => {
  it('should export BaseCalendarFormData type', () => {
    const data: BaseCalendarFormData = {
      name: 'Test',
      color: '#3b82f6',
      eventDuration: '30 minutes',
      showBusyStatus: false,
    }
    expect(data).toBeDefined()
  })

  it('should export CalendarAddFormData type', () => {
    const data: CalendarAddFormData = {
      name: 'Test',
      color: '#3b82f6',
    }
    expect(data).toBeDefined()
  })

  it('should export CalendarEditFormData type with id', () => {
    const data: CalendarEditFormData = {
      id: '123',
      name: 'Test',
      color: '#3b82f6',
      eventDuration: '30 minutes',
      showBusyStatus: false,
    }
    expect(data.id).toBe('123')
    expect(data.name).toBe('Test')
  })

  it('should allow optional fields', () => {
    const data: CalendarAddFormData = {
      name: 'Test',
      color: '#3b82f6',
      description: 'Optional',
    }
    expect(data.description).toBe('Optional')
  })
})
