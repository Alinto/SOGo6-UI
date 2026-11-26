/**
 * @jest-environment jsdom
 */
import {
  getAuthToken,
  getAuthUserId,
  isJwtExpired,
  readPersistedAuth,
  readStoredAuth,
  registerCurrentAuth,
  resetCurrentAuthForTests,
} from '../get-auth-token'

describe('isJwtExpired', () => {
  it('returns false for a token with future exp', () => {
    const payload = Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
    ).toString('base64url')
    const token = `hdr.${payload}.sig`
    expect(isJwtExpired(token)).toBe(false)
  })

  it('returns true for a token with past exp', () => {
    const payload = Buffer.from(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 10 })
    ).toString('base64url')
    const token = `hdr.${payload}.sig`
    expect(isJwtExpired(token)).toBe(true)
  })
})

describe('current tab session', () => {
  const stored = (uid: string, token: string) =>
    JSON.stringify({
      token,
      user: { uid, cn: uid, email: `${uid}@x.y` },
      rememberMe: true,
    })

  afterEach(() => {
    resetCurrentAuthForTests()
    localStorage.clear()
    sessionStorage.clear()
  })

  it('falls back to storage until a store registers its session', () => {
    localStorage.setItem('sogo_auth', stored('alice', 'tok-a'))
    expect(getAuthUserId()).toBe('alice')
    expect(getAuthToken()).toBe('tok-a')
  })

  it('uses the in-memory session even when storage holds another account', () => {
    registerCurrentAuth({
      token: 'tok-a',
      user: { uid: 'alice', cn: 'A', email: 'a@x.y' },
      rememberMe: true,
    })
    localStorage.setItem('sogo_auth', stored('bob', 'tok-b'))
    expect(getAuthUserId()).toBe('alice')
    expect(getAuthToken()).toBe('tok-a')
    expect(readStoredAuth()?.user.uid).toBe('alice')
    expect(readPersistedAuth()?.user.uid).toBe('bob')
  })

  it('returns null after this tab logged out, whatever storage holds', () => {
    registerCurrentAuth({ token: null, user: null })
    localStorage.setItem('sogo_auth', stored('bob', 'tok-b'))
    expect(getAuthUserId()).toBeNull()
    expect(getAuthToken()).toBeNull()
  })
})
