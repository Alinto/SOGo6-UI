import { isBackendWrappedResponse, unwrapApiData } from '../unwrap-api-data'

describe('unwrapApiData', () => {
  it('unwraps backend envelope', () => {
    expect(unwrapApiData({ data: { foo: 1 }, error_code: 'S000000' })).toEqual({
      foo: 1,
    })
  })

  it('returns raw payload when not wrapped', () => {
    expect(unwrapApiData({ foo: 1 })).toEqual({ foo: 1 })
  })
})

describe('isBackendWrappedResponse', () => {
  it('detects backend wrapped responses', () => {
    expect(
      isBackendWrappedResponse({ data: { foo: 1 }, error_code: 'S000000' })
    ).toBe(true)
  })

  it('returns false for plain objects without envelope', () => {
    expect(isBackendWrappedResponse({ foo: 1 })).toBe(false)
    expect(isBackendWrappedResponse(null)).toBe(false)
  })
})
