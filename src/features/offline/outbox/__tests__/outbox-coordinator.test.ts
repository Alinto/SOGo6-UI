/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import {
  getOutboxAttachments,
  getOutboxItem,
  listOutbox,
  putOutboxWithAttachments,
  setOutboxEditHold,
} from '../../db/outbox-store'
import { wipeOfflineUserData } from '../../db/wipe'
import { StorageQuotaExceededError } from '../../storage/quota'
import {
  enqueueOutbox,
  type EnqueueOutboxInput,
  isOutboxItemGoneError,
} from '../outbox-coordinator'

jest.mock('../../db/outbox-store', () => {
  const actual = jest.requireActual('../../db/outbox-store')
  return {
    ...actual,
    putOutboxWithAttachments: jest.fn(actual.putOutboxWithAttachments),
  }
})

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
  isPwaBgSyncEnabled: () => false,
}))

const userId = 'user@example.org'

function input(
  overrides: Partial<EnqueueOutboxInput> = {}
): EnqueueOutboxInput {
  return {
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: 'user@example.org',
    signatureKey: null,
    to: [{ email: 'a@b.c' }],
    cc: [],
    bcc: [],
    subject: 'S',
    body: 'B',
    isPlainText: false,
    priority: 3,
    requestReadReceipt: false,
    ...overrides,
  }
}

function file(id: string, extra: { uploaded?: boolean } = {}) {
  return {
    id,
    name: `${id}.txt`,
    size: 4,
    type: 'text/plain',
    blob: new Blob(['data']),
    ...extra,
  }
}

describe('enqueueOutbox', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('replaces an item in place, keeping createdAt and dropping old blobs and the edit hold', async () => {
    const first = await enqueueOutbox(input({ attachments: [file('a1')] }))
    await setOutboxEditHold(userId, first.id)

    const replaced = await enqueueOutbox(
      input({
        subject: 'Edited',
        attachments: [file('a2')],
        replaceOutboxId: first.id,
      })
    )

    expect(replaced.id).toBe(first.id)
    expect(replaced.createdAt).toBe(first.createdAt)
    const items = await listOutbox(userId)
    expect(items).toHaveLength(1)
    expect(items[0]?.subject).toBe('Edited')
    expect(items[0]?.status).toBe('pending')
    expect(items[0]?.editHeldAt ?? null).toBeNull()
    const blobs = await getOutboxAttachments(userId, first.id)
    expect(blobs.map((b) => b.id)).toEqual(['a2'])
  })

  it('refuses to re-create an edited item that no longer exists', async () => {
    const error = await enqueueOutbox(input({ replaceOutboxId: 'gone' })).then(
      () => null,
      (err: unknown) => err
    )
    expect(isOutboxItemGoneError(error)).toBe(true)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('keeps the uploaded marker only when a server draft key exists', async () => {
    const withKey = await enqueueOutbox(
      input({
        mailKey: 'draft-1',
        attachments: [file('a1', { uploaded: true }), file('a2')],
      })
    )
    const stored = await getOutboxAttachments(userId, withKey.id)
    expect(stored.find((a) => a.id === 'a1')?.uploaded).toBe(true)
    expect(stored.find((a) => a.id === 'a2')?.uploaded).toBe(false)

    const withoutKey = await enqueueOutbox(
      input({ attachments: [file('b1', { uploaded: true })] })
    )
    const [b1] = await getOutboxAttachments(userId, withoutKey.id)
    expect(b1?.uploaded).toBe(false)
  })

  it('rejects before writing when the storage estimate is exceeded', async () => {
    Object.defineProperty(navigator, 'storage', {
      configurable: true,
      value: { estimate: async () => ({ usage: 95, quota: 100 }) },
    })
    try {
      await expect(
        enqueueOutbox(input({ attachments: [file('a1')] }))
      ).rejects.toBeInstanceOf(StorageQuotaExceededError)
    } finally {
      Object.defineProperty(navigator, 'storage', {
        configurable: true,
        value: undefined,
      })
    }
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('maps a QuotaExceededError from IndexedDB to StorageQuotaExceededError', async () => {
    ;(putOutboxWithAttachments as jest.Mock).mockRejectedValueOnce(
      Object.assign(new Error('quota'), { name: 'QuotaExceededError' })
    )
    await expect(enqueueOutbox(input())).rejects.toBeInstanceOf(
      StorageQuotaExceededError
    )
  })

  it('stores a new pending item', async () => {
    const record = await enqueueOutbox(input())
    expect((await getOutboxItem(userId, record.id))?.status).toBe('pending')
  })
})
