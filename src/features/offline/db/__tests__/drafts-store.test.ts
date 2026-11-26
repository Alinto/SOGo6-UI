/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import type { LocalDraftRecord } from '../../types'
import {
  deleteLocalDraftIfNotNewer,
  getLocalDraft,
  upsertLocalDraft,
} from '../drafts-store'
import { wipeOfflineUserData } from '../wipe'

const userId = 'user@example.org'

function draft(updatedAt: number): LocalDraftRecord {
  return {
    id: 'd1',
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: null,
    signatureKey: null,
    to: [],
    cc: [],
    bcc: [],
    subject: 'Hi',
    body: 'Body',
    isPlainText: false,
    priority: 3,
    requestReadReceipt: false,
    attachments: [],
    createdAt: updatedAt,
    updatedAt,
  }
}

describe('deleteLocalDraftIfNotNewer', () => {
  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('deletes a copy not newer than the saved snapshot', async () => {
    await upsertLocalDraft(draft(1_000))
    await expect(deleteLocalDraftIfNotNewer(userId, 'd1', 1_000)).resolves.toBe(
      true
    )
    expect(await getLocalDraft(userId, 'd1')).toBeUndefined()
  })

  it('keeps a copy written after the saved snapshot', async () => {
    await upsertLocalDraft(draft(2_000))
    await expect(deleteLocalDraftIfNotNewer(userId, 'd1', 1_000)).resolves.toBe(
      false
    )
    expect(await getLocalDraft(userId, 'd1')).toBeDefined()
  })
})
