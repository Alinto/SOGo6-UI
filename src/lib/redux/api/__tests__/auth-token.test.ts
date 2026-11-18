import { pickAuthToken } from '../auth-token'

describe('pickAuthToken', () => {
  const auth = { token: 'user-token', mfaPending: { token: 'mfa-token' } }

  it('sends nothing on public endpoints', () => {
    expect(pickAuthToken(auth, 'login')).toBeNull()
    expect(pickAuthToken(auth, 'getAuthMode')).toBeNull()
    expect(pickAuthToken(auth, 'getSystem')).toBeNull()
  })

  it('sends the MFA token on the MFA login step', () => {
    expect(pickAuthToken(auth, 'mfaVerify')).toBe('mfa-token')
    expect(pickAuthToken(auth, 'mfaEnrollBegin')).toBe('mfa-token')
    expect(pickAuthToken(auth, 'mfaEnrollConfirm')).toBe('mfa-token')
  })

  it('never sends the user token on the MFA login step', () => {
    expect(pickAuthToken({ token: 'user-token' }, 'mfaVerify')).toBeNull()
    expect(
      pickAuthToken({ token: 'user-token', mfaPending: null }, 'mfaVerify')
    ).toBeNull()
  })

  it('sends the user token on other endpoints (MFA settings included)', () => {
    expect(pickAuthToken(auth, 'getMfaStatus')).toBe('user-token')
    expect(pickAuthToken(auth, 'beginMfaSetup')).toBe('user-token')
    expect(pickAuthToken({ token: null }, 'getUserProfile')).toBeNull()
    expect(pickAuthToken(undefined, 'getUserProfile')).toBeNull()
  })
})
