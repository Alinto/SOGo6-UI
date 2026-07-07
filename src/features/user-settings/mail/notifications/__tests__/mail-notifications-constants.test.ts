import {
  DEFAULT_NOTIFICATION,
  MAX_NOTIFY_ADDRESSES,
} from '../mail-notifications-constants'

describe('mail-notifications-constants', () => {
  it('limits notify addresses count', () => {
    expect(MAX_NOTIFY_ADDRESSES).toBe(10)
  })

  it('provides empty defaults for notification settings', () => {
    expect(DEFAULT_NOTIFICATION.enabled).toBe(false)
    expect(DEFAULT_NOTIFICATION.addresses).toEqual([])
    expect(DEFAULT_NOTIFICATION.message).toBe('')
  })
})
