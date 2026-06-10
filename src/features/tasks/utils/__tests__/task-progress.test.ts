import { getDisplayTaskProgress, clampTaskProgress } from '../task-progress'

describe('clampTaskProgress', () => {
  it('clamps values to 0-100', () => {
    expect(clampTaskProgress(-5)).toBe(0)
    expect(clampTaskProgress(150)).toBe(100)
    expect(clampTaskProgress(40)).toBe(40)
  })
})

describe('getDisplayTaskProgress', () => {
  it('returns percent for in_process tasks', () => {
    expect(
      getDisplayTaskProgress({ status: 'in_process', percent_complete: 40 })
    ).toBe(40)
  })

  it('returns percent for partial progress on other statuses', () => {
    expect(
      getDisplayTaskProgress({ status: 'needs_action', percent_complete: 25 })
    ).toBe(25)
  })

  it('returns null for completed, cancelled, or zero progress', () => {
    expect(
      getDisplayTaskProgress({ status: 'completed', percent_complete: 100 })
    ).toBeNull()
    expect(
      getDisplayTaskProgress({ status: 'cancelled', percent_complete: 50 })
    ).toBeNull()
    expect(
      getDisplayTaskProgress({ status: 'needs_action', percent_complete: 0 })
    ).toBeNull()
  })
})
