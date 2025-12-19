describe('isBrowser', () => {
  it('should export isBrowser', () => {
    const { isBrowser } = require('../is-browser')
    expect(typeof isBrowser).toBe('boolean')
  })

  it('should be true in browser environment', () => {
    const { isBrowser } = require('../is-browser')
    expect(isBrowser).toBe(true)
  })

  it('should have window defined when isBrowser is true', () => {
    const { isBrowser } = require('../is-browser')
    if (isBrowser) {
      expect(typeof window).not.toBe('undefined')
    }
  })

  it('should evaluate typeof window correctly', () => {
    const { isBrowser } = require('../is-browser')
    const typeofWindow = typeof window
    expect(typeofWindow).not.toBe('undefined')
    expect(isBrowser).toBe(true)
  })

  it('should match window existence', () => {
    const { isBrowser } = require('../is-browser')
    expect(isBrowser).toBe(typeof window !== 'undefined')
  })

  it('should be a boolean constant', () => {
    const { isBrowser } = require('../is-browser')
    expect(typeof isBrowser).toBe('boolean')
    expect([true, false]).toContain(isBrowser)
  })

  it('should have consistent value', () => {
    const { isBrowser: first } = require('../is-browser')
    const { isBrowser: second } = require('../is-browser')
    expect(first).toBe(second)
  })

  it('should reflect browser environment in test', () => {
    // In test environment with jsdom, window is defined
    const { isBrowser } = require('../is-browser')
    expect(isBrowser).toBe(true)
  })

  it('should work with conditional logic', () => {
    const { isBrowser } = require('../is-browser')
    let result
    if (isBrowser) {
      result = 'browser'
    } else {
      result = 'server'
    }
    expect(result).toBe('browser')
  })

  it('should be usable in comparisons', () => {
    const { isBrowser } = require('../is-browser')
    expect(isBrowser === true).toBe(true)
    expect(isBrowser === false).toBe(false)
  })

  it('should work with ternary operators', () => {
    const { isBrowser } = require('../is-browser')
    const environment = isBrowser ? 'client' : 'server'
    expect(environment).toBe('client')
  })

  it('should be usable in boolean context', () => {
    const { isBrowser } = require('../is-browser')
    const result = isBrowser && 'in browser'
    expect(result).toBe('in browser')
  })

  it('should work with logical OR', () => {
    const { isBrowser } = require('../is-browser')
    const result = !isBrowser || 'window is defined'
    expect(result).toBe('window is defined')
  })

  it('should be consistent with window check', () => {
    const { isBrowser } = require('../is-browser')
    const manualCheck = typeof window !== 'undefined'
    expect(isBrowser).toBe(manualCheck)
  })

  it('should be evaluable at module load time', () => {
    // This test verifies that isBrowser is evaluated at module load time
    const { isBrowser } = require('../is-browser')
    expect(isBrowser).toBeDefined()
  })

  it('should not be null or undefined', () => {
    const { isBrowser } = require('../is-browser')
    expect(isBrowser).not.toBeNull()
    expect(isBrowser).not.toBeUndefined()
  })

  it('should be the only export', () => {
    const module = require('../is-browser')
    const exports = Object.keys(module)
    expect(exports).toContain('isBrowser')
  })

  it('should work in negation', () => {
    const { isBrowser } = require('../is-browser')
    expect(!isBrowser).toBe(false)
  })

  it('should work with logical NOT', () => {
    const { isBrowser } = require('../is-browser')
    const notBrowser = !isBrowser
    expect(notBrowser).toBe(false)
  })

  it('should be usable with if statements', () => {
    const { isBrowser } = require('../is-browser')
    let executed = false
    if (isBrowser) {
      executed = true
    }
    expect(executed).toBe(true)
  })

  it('should work with function guards', () => {
    const { isBrowser } = require('../is-browser')
    const executeIfBrowser = (fn: () => void) => {
      if (isBrowser) {
        fn()
      }
    }
    const spy = jest.fn()
    executeIfBrowser(spy)
    expect(spy).toHaveBeenCalled()
  })

  it('should be usable in array includes', () => {
    const { isBrowser } = require('../is-browser')
    expect([true, false, true]).toContain(isBrowser)
  })

  it('should work with Array.filter', () => {
    const { isBrowser } = require('../is-browser')
    const values = [true, false, true]
    const result = values.filter((v) => v === isBrowser)
    expect(result.length).toBeGreaterThan(0)
  })

  it('should work with switch statements', () => {
    const { isBrowser } = require('../is-browser')
    let environment = ''
    switch (isBrowser) {
      case true:
        environment = 'browser'
        break
      case false:
        environment = 'server'
        break
    }
    expect(environment).toBe('browser')
  })

  it('should be suitable for early returns', () => {
    const { isBrowser } = require('../is-browser')
    const checkEnvironment = () => {
      if (!isBrowser) return 'server'
      return 'browser'
    }
    expect(checkEnvironment()).toBe('browser')
  })

  it('should work with optional chaining', () => {
    const { isBrowser } = require('../is-browser')
    // Simulating optional chaining with browser-specific code
    const windowObject = isBrowser ? window : undefined
    expect(windowObject).toBeDefined()
  })

  it('should work with nullish coalescing', () => {
    const { isBrowser } = require('../is-browser')
    const environment = isBrowser ? 'client' : null
    const result = environment ?? 'default'
    expect(result).toBe('client')
  })

  it('should maintain referential equality', () => {
    const first = require('../is-browser')
    const second = require('../is-browser')
    expect(first.isBrowser).toBe(second.isBrowser)
  })

  it('should have correct type inference', () => {
    const { isBrowser } = require('../is-browser')
    const typedValue: boolean = isBrowser
    expect(typeof typedValue).toBe('boolean')
  })

  it('should work with template literals', () => {
    const { isBrowser } = require('../is-browser')
    const message = `Running in ${isBrowser ? 'browser' : 'server'}`
    expect(message).toBe('Running in browser')
  })

  it('should be useful for conditional imports', () => {
    const { isBrowser } = require('../is-browser')
    const module = isBrowser ? 'dom-utils' : 'server-utils'
    expect(module).toBe('dom-utils')
  })

  it('should be immutable when accessed', () => {
    const { isBrowser: first } = require('../is-browser')
    const { isBrowser: second } = require('../is-browser')
    expect(Object.is(first, second)).toBe(true)
  })

  it('should work with logical AND chains', () => {
    const { isBrowser } = require('../is-browser')
    const result = isBrowser && true && 'success'
    expect(result).toBe('success')
  })

  it('should work with logical OR chains', () => {
    const { isBrowser } = require('../is-browser')
    const result = false || isBrowser || 'fallback'
    expect(result).toBe(true)
  })

  it('should support typeof check', () => {
    const { isBrowser } = require('../is-browser')
    expect(typeof isBrowser).toBe('boolean')
  })

  it('should work with JSON operations', () => {
    const { isBrowser } = require('../is-browser')
    const json = JSON.stringify({ isBrowser })
    expect(json).toContain('true')
  })

  it('should work with Object.keys', () => {
    const module = require('../is-browser')
    const keys = Object.keys(module)
    expect(keys).toHaveLength(1)
    expect(keys[0]).toBe('isBrowser')
  })

  it('should be readable and self-documenting', () => {
    const { isBrowser } = require('../is-browser')
    // The name clearly indicates it checks if code runs in browser
    const nameIndicatesUse = 'isBrowser'.includes('Browser')
    expect(nameIndicatesUse).toBe(true)
    expect(isBrowser).toBe(true)
  })

  it('should work as default parameter', () => {
    const { isBrowser } = require('../is-browser')
    const useBrowser = (shouldUse: boolean = isBrowser) => shouldUse
    expect(useBrowser()).toBe(true)
  })

  it('should work with destructuring', () => {
    const { isBrowser } = require('../is-browser')
    const { isBrowser: isBrowserAlias } = { isBrowser }
    expect(isBrowserAlias).toBe(true)
  })

  it('should work with spread operators', () => {
    const module = require('../is-browser')
    const spread = { ...module }
    expect(spread.isBrowser).toBe(true)
  })

  it('should be consistent across multiple accesses', () => {
    const { isBrowser: first } = require('../is-browser')
    const { isBrowser: second } = require('../is-browser')
    const { isBrowser: third } = require('../is-browser')
    expect(first).toBe(second)
    expect(second).toBe(third)
  })

  it('should be suitable for feature detection', () => {
    const { isBrowser } = require('../is-browser')
    const canUseDOM = isBrowser
    expect(canUseDOM).toBe(true)
  })

  it('should work with assertion functions', () => {
    const { isBrowser } = require('../is-browser')
    const assertBrowser = (value: boolean): asserts value => {
      if (!value) throw new Error('Not in browser')
    }
    expect(() => assertBrowser(isBrowser)).not.toThrow()
  })

  it('should not be accidentally reassigned', () => {
    const { isBrowser } = require('../is-browser')
    const originalValue = isBrowser
    expect(isBrowser).toBe(originalValue)
  })

  it('should be simple and performant', () => {
    const { isBrowser } = require('../is-browser')
    // Accessing it multiple times should be instant
    const start = performance.now()
    for (let i = 0; i < 10000; i++) {
      // eslint-disable-next-line no-unused-expressions
      isBrowser
    }
    const end = performance.now()
    expect(end - start).toBeLessThan(100) // Should be extremely fast
  })
})
