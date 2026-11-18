import {
  collectNewReminders,
  reminderNotificationKey,
} from '../reminder-dedupe'

describe('reminder dedupe', () => {
  const reminder = {
    event_key: 'evt-1',
    trigger_at: '2026-11-18T10:00:00Z',
    title: 'Standup',
  }

  it('builds a stable key from the event and trigger', () => {
    expect(reminderNotificationKey(reminder)).toBe('evt-1|2026-11-18T10:00:00Z')
  })

  it('notifies a reminder once for the same event and trigger', () => {
    const seen = new Set<string>()
    expect(collectNewReminders([reminder], seen)).toEqual([reminder])
    expect(collectNewReminders([reminder], seen)).toEqual([])
  })
})
