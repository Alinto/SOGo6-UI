import { getSsoErrorMessage } from '../sso-error-message'
import {
  decodeJwtPayload,
  hasSsoCallbackResult,
  isAbsoluteHttpUrl,
} from '../utils'

function payloadSegment(payload: object): string {
  const bytes = new TextEncoder().encode(JSON.stringify(payload))
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

describe('decodeJwtPayload', () => {
  it('decodes an unpadded base64url payload', () => {
    const payload = {
      uid: 'user',
      cn: 'John Do',
      email: 'user@example.com',
    }
    const segment = payloadSegment(payload)
    expect(segment.length % 4).not.toBe(0)

    expect(decodeJwtPayload(`h.${segment}.s`)).toEqual(payload)
  })

  it('decodes a display name with an accent', () => {
    const payload = {
      uid: 'user',
      cn: 'Élise André',
      email: 'elise@example.com',
    }

    expect(decodeJwtPayload(`h.${payloadSegment(payload)}.s`)).toEqual(payload)
  })

  it('rejects a token that is not a jwt', () => {
    expect(() => decodeJwtPayload('not-a-jwt')).toThrow()
  })

  it('rejects a payload missing the user fields', () => {
    expect(() =>
      decodeJwtPayload(`h.${payloadSegment({ uid: 'user' })}.s`)
    ).toThrow()
  })
})

describe('isAbsoluteHttpUrl', () => {
  it('accepts absolute http and https urls', () => {
    expect(isAbsoluteHttpUrl('https://idp.example/auth')).toBe(true)
    expect(isAbsoluteHttpUrl('http://localhost:8080/auth')).toBe(true)
  })

  it('rejects empty, relative, and non-http urls', () => {
    expect(isAbsoluteHttpUrl('')).toBe(false)
    expect(isAbsoluteHttpUrl('/auth')).toBe(false)
    expect(isAbsoluteHttpUrl('javascript:alert(1)')).toBe(false)
  })
})

describe('hasSsoCallbackResult', () => {
  it('detects a token or an error in the fragment', () => {
    expect(hasSsoCallbackResult('#token=abc')).toBe(true)
    expect(hasSsoCallbackResult('#error=S000212')).toBe(true)
    expect(hasSsoCallbackResult('')).toBe(false)
    expect(hasSsoCallbackResult('#other=1')).toBe(false)
  })
})

describe('getSsoErrorMessage', () => {
  const t = jest.fn((key: string, values?: { code: string }) =>
    values?.code ? `${key}:${values.code}` : key
  )

  beforeEach(() => {
    t.mockClear()
  })

  it('maps known SSO codes', () => {
    expect(getSsoErrorMessage(t, 'S000215')).toBe(
      'error.sso_redirect_not_allowed.string'
    )
  })

  it('keeps the code for an unknown error', () => {
    expect(getSsoErrorMessage(t, 'S000299')).toBe(
      'error.sso_failed.string:S000299'
    )
  })

  it('uses the generic message when there is no code', () => {
    expect(getSsoErrorMessage(t, '')).toBe('error.generic.string')
    expect(getSsoErrorMessage(t, null)).toBe('error.generic.string')
  })
})
