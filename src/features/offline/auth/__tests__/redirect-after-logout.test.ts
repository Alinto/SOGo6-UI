import {
  redirectAfterLogout,
  resolveLogoutRedirect,
} from '../redirect-after-logout'

describe('resolveLogoutRedirect', () => {
  it('pushes login when document navigation is allowed', () => {
    expect(resolveLogoutRedirect(false)).toEqual({
      mode: 'push',
      href: '/auth/login',
    })
  })

  it('replaces the URL with the locale-prefixed login path when navigation must be skipped', () => {
    expect(
      resolveLogoutRedirect(true, 'https://sogo.example/fr/u/0/INBOX')
    ).toEqual({
      mode: 'replace-login',
      href: '/fr/auth/login',
    })
  })
})

describe('redirectAfterLogout', () => {
  const originalOnLine = navigator.onLine
  const replaceState = jest.spyOn(window.history, 'replaceState')

  afterEach(() => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: originalOnLine,
    })
    replaceState.mockClear()
  })

  afterAll(() => {
    replaceState.mockRestore()
  })

  it('replaces history with the precached login path when offline', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: false,
    })
    const push = jest.fn()

    redirectAfterLogout(push)

    expect(push).not.toHaveBeenCalled()
    expect(replaceState).toHaveBeenCalledWith(
      window.history.state,
      '',
      '/en/auth/login'
    )
  })

  it('pushes login when online', () => {
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      value: true,
    })
    const push = jest.fn()

    redirectAfterLogout(push)

    expect(push).toHaveBeenCalledWith('/auth/login')
    expect(replaceState).not.toHaveBeenCalled()
  })
})
