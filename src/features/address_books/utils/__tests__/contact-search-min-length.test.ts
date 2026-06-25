import { resolveContactSearchMinLength } from '../contact-search-min-length'

describe('resolveContactSearchMinLength', () => {
  it('uses configured numeric value', () => {
    expect(resolveContactSearchMinLength(3)).toBe(3)
  })

  it('falls back to default', () => {
    expect(resolveContactSearchMinLength(undefined)).toBe(2)
  })
})
