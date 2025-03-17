import { cn } from '../utils'

// filepath: src/lib/utils.test.ts

describe('cn function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional class names', () => {
    const result = cn('class1', false && 'class2', 'class3')
    expect(result).toBe('class1 class3')
  })

  it('handles arrays of class names', () => {
    const result = cn(['class1', 'class2'], 'class3')
    expect(result).toBe('class1 class2 class3')
  })

  it('handles objects with boolean values', () => {
    const result = cn({ class1: true, class2: false }, 'class3')
    expect(result).toBe('class1 class3')
  })

  it('handles undefined and null values', () => {
    const result = cn('class1', undefined, null, 'class2')
    expect(result).toBe('class1 class2')
  })

  it('merges Tailwind classes correctly', () => {
    const result = cn('p-2', 'p-4')
    expect(result).toBe('p-4')
  })

  it('handles complex combinations', () => {
    const result = cn(
      'class1',
      ['class2', { class3: true, class4: false }],
      'class5'
    )
    expect(result).toBe('class1 class2 class3 class5')
  })
})
