import { DEFAULT_FORWARD, MAX_FORWARD_ADDRESSES } from '../mail-forward-constants'

describe('mail-forward-constants', () => {
  it('limits forward addresses count', () => {
    expect(MAX_FORWARD_ADDRESSES).toBe(10)
  })

  it('provides empty defaults for forward settings', () => {
    expect(DEFAULT_FORWARD.enabled).toBe(false)
    expect(DEFAULT_FORWARD.addresses).toEqual([])
    expect(DEFAULT_FORWARD.alwaysSend).toBe(false)
    expect(DEFAULT_FORWARD.keepCopy).toBe(false)
  })
})
