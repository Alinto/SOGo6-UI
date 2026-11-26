/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { getOutboxItem, putOutboxWithAttachments } from '../../db/outbox-store'
import { wipeOfflineUserData } from '../../db/wipe'
import { OUTBOX_EDIT_HOLD_TTL_MS, type OutboxRecord } from '../../types'
import {
  holdOutboxForEdit,
  isOutboxEditHoldLive,
  isOutboxHeldForEdit,
  releaseOutboxForEdit,
  resetOutboxEditHolds,
} from '../outbox-edit-hold'

jest.mock('../../auth/get-auth-token', () => ({
  getAuthUserId: () => 'user@example.org',
}))

const userId = 'user@example.org'

function item(overrides: Partial<OutboxRecord> = {}): OutboxRecord {
  return {
    id: 'o1',
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: userId,
    signatureKey: null,
    to: [{ email: 'a@b.c' }],
    cc: [],
    bcc: [],
    subject: 'S',
    body: 'B',
    isPlainText: false,
    priority: 3,
    requestReadReceipt: false,
    attachmentIds: [],
    status: 'pending',
    retryCount: 0,
    lastError: null,
    createdAt: 1,
    updatedAt: 1,
    ...overrides,
  }
}

/** Minimal Web Locks stand-in: tracks held names, grants immediately. */
function installFakeLocks() {
  const held: { name: string }[] = []
  Object.defineProperty(navigator, 'locks', {
    configurable: true,
    value: {
      request: (
        name: string,
        _options: unknown,
        callback: () => Promise<void>
      ) => {
        const entry = { name }
        held.push(entry)
        return callback().finally(() => {
          held.splice(held.indexOf(entry), 1)
        })
      },
      query: async () => ({ held: [...held], pending: [] }),
    },
  })
  return held
}

describe('outbox edit hold', () => {
  afterEach(async () => {
    resetOutboxEditHolds()
    Object.defineProperty(navigator, 'locks', {
      configurable: true,
      value: undefined,
    })
    await wipeOfflineUserData(userId)
  })

  it('persists the hold so other tabs see it, and clears it on release', async () => {
    await putOutboxWithAttachments(item(), [])
    const held = await holdOutboxForEdit(userId, 'o1')
    expect(held?.editHeldAt).toEqual(expect.any(Number))
    expect(isOutboxHeldForEdit('o1')).toBe(true)
    expect((await getOutboxItem(userId, 'o1'))?.editHeldAt).toBe(
      held?.editHeldAt
    )

    releaseOutboxForEdit('o1')
    expect(isOutboxHeldForEdit('o1')).toBe(false)
    await waitFor(
      async () => (await getOutboxItem(userId, 'o1'))?.editHeldAt == null
    )
  })

  it('refuses to hold an item that is being sent', async () => {
    await putOutboxWithAttachments(item({ status: 'sending' }), [])
    expect(await holdOutboxForEdit(userId, 'o1')).toBeNull()
    expect(isOutboxHeldForEdit('o1')).toBe(false)
  })

  it('uses the Web Lock to tell a live hold from a crashed tab', async () => {
    const held = installFakeLocks()
    await putOutboxWithAttachments(item(), [])
    await holdOutboxForEdit(userId, 'o1')
    expect(held.map((lock) => lock.name)).toEqual(['sogo-outbox-edit-o1'])

    const record = (await getOutboxItem(userId, 'o1'))!
    // Another tab only sees the persisted flag and the lock.
    resetOutboxEditHolds()
    await waitFor(async () => held.length === 0)
    expect(await isOutboxEditHoldLive(record)).toBe(false)
  })

  it('falls back to a TTL without Web Locks', async () => {
    expect(
      await isOutboxEditHoldLive({ id: 'x', editHeldAt: Date.now() })
    ).toBe(true)
    expect(
      await isOutboxEditHoldLive({
        id: 'x',
        editHeldAt: Date.now() - OUTBOX_EDIT_HOLD_TTL_MS - 1,
      })
    ).toBe(false)
    expect(await isOutboxEditHoldLive({ id: 'x', editHeldAt: null })).toBe(
      false
    )
  })
})

async function waitFor(check: () => Promise<boolean>) {
  for (let i = 0; i < 100; i += 1) {
    if (await check()) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  throw new Error('condition not met')
}
