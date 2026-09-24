import { moduleDisabled } from '../module-disabled'

describe('moduleDisabled', () => {
  it('allows the module when the list is empty, null, or missing', () => {
    expect(moduleDisabled([], 'mail')).toBe(false)
    expect(moduleDisabled(null, 'mail')).toBe(false)
    expect(moduleDisabled(undefined, 'mail')).toBe(false)
  })

  it('allows mail when only another module is listed', () => {
    expect(moduleDisabled(['calendar'], 'mail')).toBe(false)
  })

  it('disables mail when the list contains mail', () => {
    expect(moduleDisabled(['mail'], 'mail')).toBe(true)
    expect(moduleDisabled(['mail', 'calendar', 'contact'], 'mail')).toBe(true)
  })
})
