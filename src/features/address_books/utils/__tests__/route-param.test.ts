import { decodeRouteParam, encodePathSegment, routeParam } from '../route-param'

describe('route-param', () => {
  it('decodes a route param once', () => {
    expect(decodeRouteParam('sogo-tests2%40example.org')).toBe(
      'sogo-tests2@example.org'
    )
    expect(decodeRouteParam('sogo-tests2@example.org')).toBe(
      'sogo-tests2@example.org'
    )
  })

  it('encodes @ once, including when the value is already encoded', () => {
    expect(encodePathSegment('sogo-tests2@example.org')).toBe(
      'sogo-tests2%40example.org'
    )
    expect(encodePathSegment('sogo-tests2%40example.org')).toBe(
      'sogo-tests2%40example.org'
    )
  })

  it('reads a string or a single-element param array', () => {
    expect(routeParam('sogo-tests2%40example.org')).toBe(
      'sogo-tests2@example.org'
    )
    expect(routeParam(['sogo-tests2%40example.org'])).toBe(
      'sogo-tests2@example.org'
    )
    expect(routeParam(undefined)).toBeUndefined()
  })
})
