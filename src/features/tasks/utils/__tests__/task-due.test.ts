import {
  isTaskDueSoon,
  isTaskDueToday,
  isTaskOverdue,
  isTaskUpcoming,
} from '../task-due'
import type { Task } from '../../tasks-types'

const base: Task = {
  id: '1',
  title: 'Test',
  status: 'needs_action',
}

describe('task-due', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-05-28T12:00:00Z'))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('isTaskOverdue', () => {
    it('returns false without due date', () => {
      expect(isTaskOverdue(base)).toBe(false)
    })

    it('returns false for completed tasks', () => {
      expect(
        isTaskOverdue({
          ...base,
          status: 'completed',
          due: '2020-01-01T00:00:00.000Z',
        })
      ).toBe(false)
    })

    it('returns true when due is in the past', () => {
      expect(
        isTaskOverdue({ ...base, due: '2025-05-27T23:59:00.000Z' })
      ).toBe(true)
    })

    it('returns false for invalid due', () => {
      expect(isTaskOverdue({ ...base, due: 'not-a-date' })).toBe(false)
    })
  })

  describe('isTaskDueToday', () => {
    it('returns true when due is today', () => {
      expect(
        isTaskDueToday({ ...base, due: '2025-05-28T18:00:00.000Z' })
      ).toBe(true)
    })

    it('returns false when due is tomorrow', () => {
      expect(
        isTaskDueToday({ ...base, due: '2025-05-29T10:00:00.000Z' })
      ).toBe(false)
    })
  })

  describe('isTaskDueSoon', () => {
    it('returns true for due within window', () => {
      expect(
        isTaskDueSoon({ ...base, due: '2025-05-30T10:00:00.000Z' }, 7)
      ).toBe(true)
    })

    it('returns false when overdue', () => {
      expect(
        isTaskDueSoon({ ...base, due: '2025-05-20T10:00:00.000Z' }, 7)
      ).toBe(false)
    })
  })

  describe('isTaskUpcoming', () => {
    it('returns true for due after today within window', () => {
      expect(
        isTaskUpcoming({ ...base, due: '2025-05-30T10:00:00.000Z' })
      ).toBe(true)
    })

    it('returns false for due today', () => {
      expect(
        isTaskUpcoming({ ...base, due: '2025-05-28T18:00:00.000Z' })
      ).toBe(false)
    })
  })
})
