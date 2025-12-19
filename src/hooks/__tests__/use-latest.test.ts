import { renderHook } from '@testing-library/react'
import { useLatest } from '../use-latest'

describe('useLatest', () => {
  it('should initialize ref with provided value', () => {
    const { result } = renderHook(() => useLatest('test'))

    expect(result.current.current).toBe('test')
  })

  it('should initialize ref with number value', () => {
    const { result } = renderHook(() => useLatest(42))

    expect(result.current.current).toBe(42)
  })

  it('should initialize ref with boolean value', () => {
    const { result } = renderHook(() => useLatest(true))

    expect(result.current.current).toBe(true)
  })

  it('should initialize ref with null value', () => {
    const { result } = renderHook(() => useLatest(null))

    expect(result.current.current).toBeNull()
  })

  it('should initialize ref with undefined value', () => {
    const { result } = renderHook(() => useLatest(undefined))

    expect(result.current.current).toBeUndefined()
  })

  it('should initialize ref with object value', () => {
    const obj = { key: 'value' }
    const { result } = renderHook(() => useLatest(obj))

    expect(result.current.current).toBe(obj)
  })

  it('should initialize ref with array value', () => {
    const arr = [1, 2, 3]
    const { result } = renderHook(() => useLatest(arr))

    expect(result.current.current).toBe(arr)
  })

  it('should return a ref object', () => {
    const { result } = renderHook(() => useLatest('test'))

    expect(result.current).toHaveProperty('current')
  })

  it('should update ref.current when value changes', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'initial' },
    })

    expect(result.current.current).toBe('initial')

    rerender({ value: 'updated' })

    expect(result.current.current).toBe('updated')
  })

  it('should update ref.current multiple times', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'first' },
    })

    expect(result.current.current).toBe('first')

    rerender({ value: 'second' })
    expect(result.current.current).toBe('second')

    rerender({ value: 'third' })
    expect(result.current.current).toBe('third')

    rerender({ value: 'fourth' })
    expect(result.current.current).toBe('fourth')
  })

  it('should maintain ref object identity across re-renders', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'initial' },
    })

    const firstRef = result.current

    rerender({ value: 'updated' })

    const secondRef = result.current

    expect(firstRef).toBe(secondRef)
  })

  it('should update ref with number changes', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 1 },
    })

    expect(result.current.current).toBe(1)

    rerender({ value: 2 })
    expect(result.current.current).toBe(2)

    rerender({ value: 100 })
    expect(result.current.current).toBe(100)
  })

  it('should update ref with object changes', () => {
    const obj1 = { id: 1 }
    const obj2 = { id: 2 }
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: obj1 },
    })

    expect(result.current.current).toBe(obj1)

    rerender({ value: obj2 })
    expect(result.current.current).toBe(obj2)
  })

  it('should handle undefined to value transition', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: undefined },
    })

    expect(result.current.current).toBeUndefined()

    rerender({ value: 'defined' })
    expect(result.current.current).toBe('defined')
  })

  it('should handle null to value transition', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: null },
    })

    expect(result.current.current).toBeNull()

    rerender({ value: 'not null' })
    expect(result.current.current).toBe('not null')
  })

  it('should handle value to null transition', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 'something' },
    })

    expect(result.current.current).toBe('something')

    rerender({ value: null })
    expect(result.current.current).toBeNull()
  })

  it('should work with function values', () => {
    const fn = jest.fn()
    const { result } = renderHook(() => useLatest(fn))

    expect(result.current.current).toBe(fn)
  })

  it('should update ref with different function values', () => {
    const fn1 = jest.fn()
    const fn2 = jest.fn()
    const { result, rerender } = renderHook(({ fn }) => useLatest(fn), {
      initialProps: { fn: fn1 },
    })

    expect(result.current.current).toBe(fn1)

    rerender({ fn: fn2 })
    expect(result.current.current).toBe(fn2)
  })

  it('should work with generic types', () => {
    interface User {
      id: number
      name: string
    }

    const user: User = { id: 1, name: 'John' }
    const { result } = renderHook(() => useLatest<User>(user))

    expect(result.current.current).toBe(user)
    expect(result.current.current.id).toBe(1)
    expect(result.current.current.name).toBe('John')
  })

  it('should update generic type values', () => {
    interface User {
      id: number
      name: string
    }

    const user1: User = { id: 1, name: 'John' }
    const user2: User = { id: 2, name: 'Jane' }

    const { result, rerender } = renderHook(
      ({ user }) => useLatest<User>(user),
      {
        initialProps: { user: user1 },
      }
    )

    expect(result.current.current.name).toBe('John')

    rerender({ user: user2 })
    expect(result.current.current.name).toBe('Jane')
  })

  it('should work with array values', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]
    const { result, rerender } = renderHook(({ arr }) => useLatest(arr), {
      initialProps: { arr: arr1 },
    })

    expect(result.current.current).toEqual([1, 2, 3])

    rerender({ arr: arr2 })
    expect(result.current.current).toEqual([4, 5, 6])
  })

  it('should work with nested objects', () => {
    const obj1 = { nested: { value: 'first' } }
    const obj2 = { nested: { value: 'second' } }
    const { result, rerender } = renderHook(({ obj }) => useLatest(obj), {
      initialProps: { obj: obj1 },
    })

    expect(result.current.current.nested.value).toBe('first')

    rerender({ obj: obj2 })
    expect(result.current.current.nested.value).toBe('second')
  })

  it('should handle falsy values correctly', () => {
    const { result, rerender } = renderHook(({ value }) => useLatest(value), {
      initialProps: { value: 0 },
    })

    expect(result.current.current).toBe(0)

    rerender({ value: '' })
    expect(result.current.current).toBe('')

    rerender({ value: false })
    expect(result.current.current).toBe(false)
  })

  it('should allow manual mutation of ref', () => {
    const { result } = renderHook(() => useLatest('initial'))

    expect(result.current.current).toBe('initial')

    result.current.current = 'manually updated'
    expect(result.current.current).toBe('manually updated')
  })

  it('should provide access to ref.current for external use', () => {
    const value = { data: 'test' }
    const { result } = renderHook(() => useLatest(value))

    // Simulate external code accessing the ref
    const externalValue = result.current.current
    expect(externalValue).toEqual(value)
    expect(externalValue.data).toBe('test')
  })
})
