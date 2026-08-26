import { resolveLogoutRedirect } from '../redirect-after-logout'

describe('resolveLogoutRedirect', () => {
  it('pushes login when document navigation is allowed', () => {
    expect(resolveLogoutRedirect(false)).toEqual({
      mode: 'push',
      href: '/auth/login',
    })
  })

  it('stays on the current document when navigation must be skipped', () => {
    expect(resolveLogoutRedirect(true)).toEqual({ mode: 'stay' })
  })
})
