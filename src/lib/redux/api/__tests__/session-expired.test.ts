import { shouldEndSession } from '../session-expired'

describe('shouldEndSession', () => {
  it('ends the session on 401 for an authenticated endpoint', () => {
    expect(shouldEndSession('getUserProfile', 401)).toBe(true)
  })

  it('keeps a 401 on login, auth mode, system, and logout', () => {
    expect(shouldEndSession('login', 401)).toBe(false)
    expect(shouldEndSession('getAuthMode', 401)).toBe(false)
    expect(shouldEndSession('getSystem', 401)).toBe(false)
    expect(shouldEndSession('logout', 401)).toBe(false)
  })

  it('ignores other statuses', () => {
    expect(shouldEndSession('getUserProfile', 500)).toBe(false)
    expect(shouldEndSession(undefined, 401)).toBe(false)
  })
})
