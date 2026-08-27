/**
 * @jest-environment jsdom
 */
import {
  resolveOfflineRetry,
  retryOfflineNavigation,
} from '../retry-offline-navigation'

describe('resolveOfflineRetry', () => {
  it('goes back when history has a previous entry', () => {
    expect(resolveOfflineRetry(3, '/en/u/0/INBOX')).toEqual({ type: 'back' })
  })

  it('assigns the start URL when history is empty', () => {
    expect(resolveOfflineRetry(1, '/en/u/0/INBOX')).toEqual({
      type: 'assign',
      href: '/en/u/0/INBOX',
    })
  })
})

describe('retryOfflineNavigation', () => {
  it('goes back in history when there is a previous entry', () => {
    Object.defineProperty(window.history, 'length', {
      configurable: true,
      value: 3,
    })
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {})

    retryOfflineNavigation('/en/u/0/INBOX')

    expect(back).toHaveBeenCalled()
    back.mockRestore()
  })
})
