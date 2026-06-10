import {
  taskProgressFillClass,
  taskProgressTrackClass,
} from '../task-progress-styles'

describe('task-progress-styles', () => {
  describe('custom styling', () => {
    it('exports track background class', () => {
      expect(taskProgressTrackClass).toBe('bg-primary/20')
    })

    it('exports fill background class', () => {
      expect(taskProgressFillClass).toBe('bg-primary')
    })
  })
})
