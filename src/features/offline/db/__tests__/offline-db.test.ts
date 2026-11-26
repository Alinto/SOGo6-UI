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
  claimOutboxForSend,
  clearOutboxEditHold,
  countPendingOutbox,
  deleteOutboxItem,
  getOutboxAttachments,
  getOutboxItem,
  listOutbox,
  markOutboxAttachmentUploaded,
  putOutboxWithAttachments,
  setOutboxEditHold,
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
    await putOutboxWithAttachments(outbox(), [])
    expect(await countPendingOutbox(userId)).toBe(1)
    const items = await listOutbox(userId)
    expect(items[0]?.status).toBe('pending')
    await deleteOutboxItem(userId, 'out-1')
    expect(await countPendingOutbox(userId)).toBe(0)
  })

  it('wipe removes all user data', async () => {
    await upsertLocalDraft(draft())
    await putOutboxWithAttachments(outbox(), [])
    await wipeOfflineUserData(userId)
    expect(await listLocalDrafts(userId)).toHaveLength(0)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('wipe drops share session data and runtime caches', async () => {
    sessionStorage.setItem('sogo_pending_share', '{"subject":"x"}')
    const deleted: string[] = []
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: {
        keys: async () => ['pages', 'env', 'next-static', 'serwist-precache'],
        delete: async (key: string) => {
          deleted.push(key)
          return true
        },
      },
    })
    await wipeOfflineUserData(userId)
    expect(sessionStorage.getItem('sogo_pending_share')).toBeNull()
    expect(deleted.sort()).toEqual(['env', 'pages'])
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

  it('deletes an outbox row and its blobs together', async () => {
    await putOutboxWithAttachments(outbox({ attachmentIds: ['a1'] }), [
      {
        id: 'a1',
        outboxId: 'out-1',
        name: 'a.txt',
        size: 1,
        type: 'text/plain',
        blob: new Blob(['a']),
      },
    ])
    await deleteOutboxItem(userId, 'out-1')
    expect(await listOutbox(userId)).toHaveLength(0)
    expect(await getOutboxAttachments(userId, 'out-1')).toHaveLength(0)
  })

  it('refuses an edit hold while the item is sending', async () => {
    await putOutboxWithAttachments(outbox({ status: 'sending' }), [])
    expect(await setOutboxEditHold(userId, 'out-1')).toBeNull()
    expect(await setOutboxEditHold(userId, 'missing')).toBeNull()
  })

  it('does not claim an item held for edit after the snapshot', async () => {
    await putOutboxWithAttachments(outbox(), [])
    const snapshot = (await getOutboxItem(userId, 'out-1'))!
    const held = await setOutboxEditHold(userId, 'out-1')
    expect(held?.editHeldAt).toEqual(expect.any(Number))

    expect(await claimOutboxForSend(userId, snapshot, () => true)).toBeNull()
    expect((await getOutboxItem(userId, 'out-1'))?.status).toBe('pending')

    await clearOutboxEditHold(userId, 'out-1')
    const fresh = (await getOutboxItem(userId, 'out-1'))!
    const claimed = await claimOutboxForSend(userId, fresh, () => true)
    expect(claimed?.status).toBe('sending')
  })

  it('persists upload progress and the server draft key', async () => {
    await putOutboxWithAttachments(outbox({ attachmentIds: ['a1'] }), [
      {
        id: 'a1',
        outboxId: 'out-1',
        name: 'a.txt',
        size: 1,
        type: 'text/plain',
        blob: new Blob(['a']),
      },
    ])
    await markOutboxAttachmentUploaded(userId, 'out-1', 'a1', 'key-1')
    expect((await getOutboxItem(userId, 'out-1'))?.mailKey).toBe('key-1')
    expect((await getOutboxAttachments(userId, 'out-1'))[0]?.uploaded).toBe(
      true
    )
  })
})
