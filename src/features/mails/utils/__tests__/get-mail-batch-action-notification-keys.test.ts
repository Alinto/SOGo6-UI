import { getMailBatchActionNotificationKeys } from '../get-mail-batch-action-notification-keys'

describe('getMailBatchActionNotificationKeys', () => {
  it('returns null for seen flag toggles', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'untag', data: ['\\Seen'] })
    ).toBeNull()
  })

  it('returns delete keys', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'delete' })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_delete.successTitle.string',
    })
  })

  it('returns spam keys', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'spam' })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_spam.successTitle.string',
    })
  })

  it('returns ham keys', () => {
    expect(getMailBatchActionNotificationKeys({ action: 'ham' })).toMatchObject(
      {
        successTitle: 'mail_action.bulk_ham.successTitle.string',
      }
    )
  })

  it('returns move keys', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'move', data: 'Archive' })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_move.successTitle.string',
    })
  })

  it('returns copy keys', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'copy', data: 'Archive' })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_copy.successTitle.string',
    })
  })

  it('returns tag keys for custom labels', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'tag', data: ['Work'] })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_tag.successTitle.string',
    })
  })

  it('returns untag keys', () => {
    expect(
      getMailBatchActionNotificationKeys({ action: 'untag', data: ['Work'] })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_untag.successTitle.string',
    })
  })

  it('returns flag keys for tagging \\Flagged', () => {
    expect(
      getMailBatchActionNotificationKeys({
        action: 'tag',
        data: ['\\Flagged'],
      })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_flag.successTitle.string',
    })
  })

  it('returns unflag keys for untagging \\Flagged', () => {
    expect(
      getMailBatchActionNotificationKeys({
        action: 'untag',
        data: ['\\Flagged'],
      })
    ).toMatchObject({
      successTitle: 'mail_action.bulk_unflag.successTitle.string',
    })
  })
})
