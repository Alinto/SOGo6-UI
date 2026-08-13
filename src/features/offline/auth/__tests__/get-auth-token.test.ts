import { isJwtExpired } from '../get-auth-token'

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
