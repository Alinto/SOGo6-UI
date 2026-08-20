import { shouldSkipDocumentNav } from '../skip-document-nav'

describe('shouldSkipDocumentNav', () => {
  const originalOnLine = navigator.onLine

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    })
  })

  it('skips when navigator reports offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    expect(shouldSkipDocumentNav(true, false)).toBe(true)
  })

  it('skips when the app probe is offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    expect(shouldSkipDocumentNav(false, false)).toBe(true)
  })

  it('skips while a probe is in flight', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    expect(shouldSkipDocumentNav(true, true)).toBe(true)
  })

  it('allows navigation when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    expect(shouldSkipDocumentNav(true, false)).toBe(false)
  })
})
