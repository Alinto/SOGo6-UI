import manifest from '../manifest'

describe('manifest', () => {
  it('should export a function', () => {
    expect(typeof manifest).toBe('function')
  })

  it('should return a manifest object', () => {
    const result = manifest()
    expect(result).toBeDefined()
    expect(typeof result).toBe('object')
  })

  it('should have required manifest properties', () => {
    const result = manifest()
    expect(result.name).toBe('SOGo - Groupware')
    expect(result.short_name).toBe('SOGo')
    expect(result.start_url).toBe('/')
    expect(result.display).toBe('standalone')
  })

  it('should have icons array', () => {
    const result = manifest()
    expect(Array.isArray(result.icons)).toBe(true)
    expect(result.icons.length).toBeGreaterThan(0)
  })

  it('should have shortcuts array', () => {
    const result = manifest()
    expect(Array.isArray(result.shortcuts)).toBe(true)
    expect(result.shortcuts.length).toBeGreaterThan(0)
  })
})
