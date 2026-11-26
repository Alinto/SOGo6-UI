/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { getLocalDraft } from '../../db/drafts-store'
import { wipeOfflineUserData } from '../../db/wipe'
import {
  localDraftAttachmentsToCompose,
  persistLocalDraft,
} from '../use-offline-draft-sync'

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
}))

jest.mock('../../storage/quota', () => ({
  ...jest.requireActual('../../storage/quota'),
  assertStorageFits: jest.fn(async () => undefined),
}))

describe('localDraftAttachmentsToCompose', () => {
  it('rebuilds File objects from stored blobs', () => {
    const blob = new Blob(['hi'], { type: 'text/plain' })
    const [attachment] = localDraftAttachmentsToCompose('d1', [
      { id: 'a1', name: 'note.txt', size: 2, type: 'text/plain', blob },
    ])
    expect(attachment?.name).toBe('note.txt')
    expect(attachment?.file).toBeInstanceOf(File)
    expect(attachment?.file?.size).toBe(2)
  })
})

describe('localDraftAttachmentsToCompose upload state', () => {
  const meta = (id: string, uploaded?: boolean) => ({
    id,
    name: `${id}.txt`,
    size: 1,
    type: 'text/plain',
    blob: new Blob(['x']),
    uploaded,
  })

  it('gives each restored attachment its own id', () => {
    const restored = localDraftAttachmentsToCompose('d1', [
      meta('a'),
      meta('b'),
    ])
    expect(new Set(restored.map((a) => a.draftId)).size).toBe(2)
  })

  it('restores attachments already on the server draft as completed', () => {
    const [onServer, local] = localDraftAttachmentsToCompose(
      'd1',
      [meta('a', true), meta('b')],
      'mail-key'
    )
    expect(onServer?.uploadStatus).toBe('completed')
    expect(local?.uploadStatus).toBe('pending')
  })

  it('re-uploads flagged attachments when there is no server draft', () => {
    const [attachment] = localDraftAttachmentsToCompose(
      'd1',
      [meta('a', true)],
      null
    )
    expect(attachment?.uploadStatus).toBe('pending')
  })
})

describe('persistLocalDraft', () => {
  const mockAssert = jest.requireMock('../../storage/quota')
    .assertStorageFits as jest.Mock
  const userId = 'user@example.org'
  const blob = (size: number) => new Blob([new Uint8Array(size)])
  const base = {
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
  }

  afterEach(async () => {
    mockAssert.mockClear()
    await wipeOfflineUserData(userId)
  })

  it('checks the quota only for the growth over the stored record', async () => {
    const first = [{ id: 'a', name: 'a', size: 100, type: '', blob: blob(100) }]
    await persistLocalDraft({ ...base, attachments: first })
    expect(mockAssert).toHaveBeenLastCalledWith(100)

    mockAssert.mockClear()
    await persistLocalDraft({ ...base, attachments: first })
    expect(mockAssert).not.toHaveBeenCalled()

    await persistLocalDraft({
      ...base,
      attachments: [
        ...first,
        { id: 'b', name: 'b', size: 50, type: '', blob: blob(50) },
      ],
    })
    expect(mockAssert).toHaveBeenLastCalledWith(50)
  })

  it('resolves with the stored updatedAt', async () => {
    const savedAt = await persistLocalDraft({ ...base, attachments: [] })
    const row = await getLocalDraft(userId, 'd1')
    expect(row?.updatedAt).toBe(savedAt)
  })
})
