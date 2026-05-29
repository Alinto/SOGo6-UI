import { taskMatchesListFilter } from '../task-list-filter'
import type { Task } from '../../tasks-types'

const base: Task = {
  id: '1',
  title: 'Test',
  status: 'needs_action',
}

describe('taskMatchesListFilter', () => {
  it('matches today when due is today', () => {
    const today = new Date()
    today.setHours(15, 0, 0, 0)
    expect(
      taskMatchesListFilter(
        { ...base, due: today.toISOString() },
        'today'
      )
    ).toBe(true)
  })

  it('matches completed view', () => {
    expect(
      taskMatchesListFilter({ ...base, status: 'completed' }, 'completed')
    ).toBe(true)
    expect(taskMatchesListFilter(base, 'completed')).toBe(false)
  })
})
