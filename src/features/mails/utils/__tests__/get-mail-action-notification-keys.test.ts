import { getMailActionNotificationKeys } from '../get-mail-action-notification-keys'

describe('getMailActionNotificationKeys', () => {
  it('returns null for seen flag toggles', () => {
    expect(
      getMailActionNotificationKeys({ action: 'untag', data: ['\\Seen'] })
    ).toBeNull()
  })

  it('returns spam keys', () => {
    expect(getMailActionNotificationKeys({ action: 'spam' })).toMatchObject({
      successTitle: 'mail_action.spam.successTitle.string',
    })
  })

  it('returns ham keys', () => {
    expect(getMailActionNotificationKeys({ action: 'ham' })).toMatchObject({
      successTitle: 'mail_action.ham.successTitle.string',
    })
  })

  it('returns tag keys for custom labels', () => {
    expect(
      getMailActionNotificationKeys({ action: 'tag', data: ['Work'] })
    ).toMatchObject({
      successTitle: 'mail_action.tag.successTitle.string',
    })
  })
})
