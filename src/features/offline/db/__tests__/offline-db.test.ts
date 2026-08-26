/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import type { LocalDraftRecord, OutboxRecord } from '../../types'
import {
  deleteLocalDraft,
  listLocalDrafts,
  upsertLocalDraft,
} from '../drafts-store'
import {
  countPendingOutbox,
  deleteOutboxItem,
  getOutboxAttachments,
  listOutbox,
  putOutboxWithAttachments,
  upsertOutboxItem,
} from '../outbox-store'
import { wipeOfflineUserData } from '../wipe'

const userId = 'user@example.org'

function draft(partial?: Partial<LocalDraftRecord>): LocalDraftRecord {
  const now = Date.now()
  return {
    id: 'draft-1',
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: 'user@example.org',
    signatureKey: null,
    to: [{ email: 'a@b.c' }],
    cc: [],
    bcc: [],
    subject: 'Hi',
    body: 'Body',
    isPlainText: false,
    priority: 2,
    requestReadReceipt: false,
    attachments: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

function outbox(partial?: Partial<OutboxRecord>): OutboxRecord {
  const now = Date.now()
  return {
    id: 'out-1',
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: 'user@example.org',
    signatureKey: null,
    to: [{ email: 'a@b.c' }],
    cc: [],
    bcc: [],
    subject: 'Queued',
    body: 'Body',
    isPlainText: false,
    priority: 2,
    requestReadReceipt: false,
    attachmentIds: [],
    status: 'pending',
    retryCount: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    ...partial,
  }
}

describe('offline-db stores', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('CRUD local drafts', async () => {
    await upsertLocalDraft(draft())
    const listed = await listLocalDrafts(userId)
    expect(listed).toHaveLength(1)
    expect(listed[0]?.subject).toBe('Hi')
    await deleteLocalDraft(userId, 'draft-1')
    expect(await listLocalDrafts(userId)).toHaveLength(0)
  })

  it('CRUD outbox and pending count', async () => {
    await upsertOutboxItem(outbox())
    expect(await countPendingOutbox(userId)).toBe(1)
    const items = await listOutbox(userId)
    expect(items[0]?.status).toBe('pending')
    await deleteOutboxItem(userId, 'out-1')
    expect(await countPendingOutbox(userId)).toBe(0)
  })

  it('wipe removes all user data', async () => {
    await upsertLocalDraft(draft())
    await upsertOutboxItem(outbox())
    await wipeOfflineUserData(userId)
    expect(await listLocalDrafts(userId)).toHaveLength(0)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('replaces outbox attachments in one transaction without dropping the row', async () => {
    await putOutboxWithAttachments(outbox({ attachmentIds: ['old'] }), [
      {
        id: 'old',
        outboxId: 'out-1',
        name: 'old.txt',
        size: 1,
        type: 'text/plain',
        blob: new Blob(['old']),
      },
    ])

    await putOutboxWithAttachments(
      outbox({ attachmentIds: ['new'], subject: 'Updated' }),
      [
        {
          id: 'new',
          outboxId: 'out-1',
          name: 'new.txt',
          size: 1,
          type: 'text/plain',
          blob: new Blob(['new']),
        },
      ]
    )

    const items = await listOutbox(userId)
    expect(items).toHaveLength(1)
    expect(items[0]?.subject).toBe('Updated')
    const attachments = await getOutboxAttachments(userId, 'out-1')
    expect(attachments.map((attachment) => attachment.id)).toEqual(['new'])
  })
})
