import { normalizeTask } from '../normalize-task'

describe('normalizeTask', () => {
  it('maps key to id and strips date_end', () => {
    const task = normalizeTask({
      key: 'task-1',
      title: 'Test',
      date_end: '2026-01-01T00:00:00Z',
      due: '2026-01-02T00:00:00Z',
      calendar_key: 'cal-1',
    })

    expect(task.id).toBe('task-1')
    expect(task.due).toBe('2026-01-02T00:00:00Z')
    expect(task).not.toHaveProperty('date_end')
    expect(task.calendar_id).toBe('cal-1')
    expect(task.component_type).toBe('task')
  })

  it('maps date_end to due when due is absent', () => {
    const task = normalizeTask({
      key: 'task-2',
      title: 'Backend task',
      date_end: '2026-03-15T12:00:00Z',
      calendar_key: 'cal-1',
    })

    expect(task.due).toBe('2026-03-15T12:00:00Z')
  })
})
