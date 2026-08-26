import { outboxRecordToListItem } from '../outbox-to-list-item'
import type { OutboxRecord } from '../types'

const base: OutboxRecord = {
  id: 'ob-1',
  userId: 'user@example.org',
  accountId: '0',
  mailKey: null,
  identityMail: 'me@example.org',
  signatureKey: null,
  to: [{ name: 'Alice', email: 'alice@example.org' }],
  cc: [],
  bcc: [],
  subject: 'Hello',
  body: '<p>Hi</p>',
  isPlainText: false,
  priority: 2,
  requestReadReceipt: false,
  attachmentIds: ['a1'],
  status: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
}

describe('outboxRecordToListItem', () => {
  it('maps recipient, attachments and date for the mail list row', () => {
    const row = outboxRecordToListItem(base, {
      subject: 'Hello',
      snippet: 'Waiting to send',
    })

    expect(row.id).toBe('ob-1')
    expect(row.from).toEqual({ name: 'Alice', email: 'alice@example.org' })
    expect(row.hasAttachment).toBe(true)
    expect(row.priority).toBe(2)
    expect(row.snippet).toBe('Waiting to send')
    expect(row.date).toBe(new Date(1_700_000_000_000).toISOString())
    expect(row.seen).toBe(true)
    expect(row.flagged).toBe(false)
  })

  it('marks failed items as unread without starring them', () => {
    const row = outboxRecordToListItem(
      { ...base, status: 'failed', attachmentIds: [] },
      { subject: '(No subject)', snippet: 'Failed' }
    )

    expect(row.seen).toBe(false)
    expect(row.flagged).toBe(false)
    expect(row.hasAttachment).toBe(false)
    expect(row.subject).toBe('(No subject)')
  })
})
