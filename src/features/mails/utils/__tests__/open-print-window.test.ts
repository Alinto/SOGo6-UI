import { openPrintWindow } from '../open-print-window'

describe('openPrintWindow', () => {
  afterEach(() => {
    document.querySelectorAll('iframe[title="mail-print"]').forEach((el) => {
      el.remove()
    })
    jest.restoreAllMocks()
  })

  it('returns false when iframe document is unavailable', () => {
    const createElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = createElement(tagName)
      if (tagName === 'iframe') {
        Object.defineProperty(el, 'contentDocument', { value: null })
        Object.defineProperty(el, 'contentWindow', { value: null })
      }
      return el
    })

    expect(openPrintWindow('<html></html>')).toBe(false)
  })

  it('writes html into a hidden iframe and triggers print', () => {
    const print = jest.fn()
    const focus = jest.fn()
    const addEventListener = jest.fn()

    const createElement = document.createElement.bind(document)
    jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = createElement(tagName)
      if (tagName === 'iframe') {
        const doc = {
          open: jest.fn(),
          write: jest.fn(),
          close: jest.fn(),
        }
        Object.defineProperty(el, 'contentDocument', { value: doc })
        Object.defineProperty(el, 'contentWindow', {
          value: { print, focus, addEventListener },
        })
      }
      return el
    })

    expect(openPrintWindow('<html><body>Mail</body></html>')).toBe(true)
    expect(print).toHaveBeenCalled()
    expect(focus).toHaveBeenCalled()
  })
})
