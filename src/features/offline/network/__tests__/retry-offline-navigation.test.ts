/**
 * @jest-environment jsdom
 */
import { retryOfflineNavigation } from '../retry-offline-navigation'

describe('retryOfflineNavigation', () => {
  it('goes back in history', () => {
    const back = jest.spyOn(window.history, 'back').mockImplementation(() => {})

    retryOfflineNavigation()

    expect(back).toHaveBeenCalled()
    back.mockRestore()
  })
})
