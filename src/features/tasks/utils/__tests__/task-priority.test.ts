import { getPriorityBadgeClassName, getPriorityLevel } from '../task-priority'

describe('getPriorityLevel', () => {
  it('returns none for 0 or undefined', () => {
    expect(getPriorityLevel(0)).toBe('none')
    expect(getPriorityLevel(undefined)).toBe('none')
  })

  it('returns high for 1-4', () => {
    expect(getPriorityLevel(1)).toBe('high')
    expect(getPriorityLevel(4)).toBe('high')
  })

  it('returns medium for 5', () => {
    expect(getPriorityLevel(5)).toBe('medium')
  })

  it('returns low for 6-9', () => {
    expect(getPriorityLevel(6)).toBe('low')
    expect(getPriorityLevel(9)).toBe('low')
  })
})

describe('getPriorityBadgeClassName', () => {
  it('uses destructive for high, warning for medium, info for low', () => {
    expect(getPriorityBadgeClassName('high')).toMatch(/destructive/)
    expect(getPriorityBadgeClassName('medium')).toMatch(/warning/)
    expect(getPriorityBadgeClassName('low')).toMatch(/info/)
  })
})
