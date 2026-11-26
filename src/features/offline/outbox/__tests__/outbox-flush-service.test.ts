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
} from '../../db/outbox-store'
import { wipeOfflineUserData } from '../../db/wipe'
import type { OutboxAttachmentRecord, OutboxRecord } from '../../types'
import { registerBackgroundSync } from '../outbox-coordinator'
import {
  holdOutboxForEdit,
  releaseOutboxForEdit,
  resetOutboxEditHolds,
} from '../outbox-edit-hold'
import { flushOutbox, uploadTimeoutMs } from '../outbox-flush-service'

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
}))

jest.mock('../../types', () => ({
  ...jest.requireActual('../../types'),
  OUTBOX_SEND_TIMEOUT_MS: 50,
}))

jest.mock('../outbox-coordinator', () => ({
  registerBackgroundSync: jest.fn(async () => true),
}))

jest.mock('../../network/probe', () => ({
  probeNetwork: jest.fn(async () => true),
}))

jest.mock('@/lib/env-service', () => ({
  fetchEnvVars: jest.fn(async () => ({
    REACT_APP_API_BASE_URL: '/fakeApi',
  })),
}))

jest.mock('../../auth/get-auth-token', () => ({
  readStoredAuth: () => ({
    token: [
      'hdr',
      Buffer.from(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
      ).toString('base64url'),
      'sig',
    ].join('.'),
    user: { uid: 'user@example.org', cn: 'U', email: 'user@example.org' },
    rememberMe: true,
  }),
  getAuthToken: () =>
    [
      'hdr',
      Buffer.from(
        JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 3600 })
      ).toString('base64url'),
      'sig',
    ].join('.'),
  isJwtExpired: jest.fn(() => false),
}))

const userId = 'user@example.org'

function makeItem(overrides: Partial<OutboxRecord> = {}): OutboxRecord {
  const now = Date.now()
  return {
    id: 'o1',
    userId,
    accountId: '0',
    mailKey: null,
    identityMail: 'user@example.org',
    replyTo: null,
    signatureKey: null,
    to: [{ email: 'a@b.c', name: 'A' }],
    cc: [{ email: 'c@b.c' }],
    bcc: [],
    subject: 'S',
    body: 'B',
    isPlainText: false,
    priority: 2,
    requestReadReceipt: false,
    attachmentIds: [],
    status: 'pending',
    retryCount: 0,
    lastError: null,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

function okResponse() {
  return {
    ok: true,
    status: 200,
    json: async () => ({ error_code: 'S000000' }),
  }
}

describe('flushOutbox', () => {
  beforeEach(async () => {
    await wipeOfflineUserData(userId)
    const { isJwtExpired } = jest.requireMock('../../auth/get-auth-token') as {
      isJwtExpired: jest.Mock
    }
    isJwtExpired.mockReturnValue(false)
    global.fetch = jest
      .fn()
      .mockResolvedValue(okResponse()) as unknown as typeof fetch
  })

  afterEach(async () => {
    await wipeOfflineUserData(userId)
  })

  it('sends pending items and removes them', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    const result = await flushOutbox(userId)
    expect(result.sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('POSTs the SendMailBody contract to the resolved API base', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    await flushOutbox(userId)

    const [url, init] = (global.fetch as jest.Mock).mock.calls[0] as [
      string,
      RequestInit,
    ]
    expect(url).toBe('/fakeApi/mailboxes/0/mail/send')
    expect(init.method).toBe('POST')
    expect((init.headers as Record<string, string>).Authorization).toMatch(
      /^Bearer /
    )

    const body = JSON.parse(init.body as string)
    expect(body).toMatchObject({
      from: 'user@example.org',
      to: ['a@b.c'],
      cc: ['c@b.c'],
      bcc: [],
      subject: 'S',
      body: 'B',
      is_html: true,
      priority: 2,
      return_receipt: null,
      reply_to: null,
    })
    expect(body.attachments).toBeUndefined()
  })

  it('uses the mailKey send URL when a server draft exists', async () => {
    await putOutboxWithAttachments(makeItem({ mailKey: 'draft-42' }), [])
    await flushOutbox(userId)
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string]
    expect(url).toBe('/fakeApi/mailboxes/0/mail/draft-42/send')
  })

  it('uploads attachments then sends with the tmp draft key', async () => {
    await putOutboxWithAttachments(makeItem({ attachmentIds: ['a1'] }), [
      {
        id: 'a1',
        outboxId: 'o1',
        name: 'shot.png',
        size: 4,
        type: 'image/png',
        blob: new Blob(['data'], { type: 'image/png' }),
      },
    ])

    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/attachments')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            error_code: 'S000000',
            data: { key: 'tmp-key', filename: 'shot.png' },
          }),
        }
      }
      return okResponse()
    }) as unknown as typeof fetch

    const result = await flushOutbox(userId)
    expect(result.sent).toBe(1)
    expect(result.failed).toBe(0)

    const calls = (global.fetch as jest.Mock).mock.calls as [
      string,
      RequestInit,
    ][]
    expect(calls[0]![0]).toBe('/fakeApi/mailboxes/0/mail/attachments')
    expect(calls[0]![1].body).toBeInstanceOf(FormData)
    expect(calls[1]![0]).toBe('/fakeApi/mailboxes/0/mail/tmp-key/send')
    const sendBody = JSON.parse(calls[1]![1].body as string)
    expect(sendBody.attachments).toBeUndefined()
    expect(sendBody.subject).toBe('S')
  })

  it('does not auto-resend items left in sending after a crash', async () => {
    await putOutboxWithAttachments(makeItem({ status: 'sending' }), [])
    const result = await flushOutbox(userId)
    expect(result.sent).toBe(0)
    const items = await listOutbox(userId)
    expect(items).toHaveLength(1)
    expect(items[0]!.status).toBe('failed')
    expect(items[0]!.lastError).toBe('interrupted')
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('resends interrupted items when force is set', async () => {
    await putOutboxWithAttachments(makeItem({ status: 'sending' }), [])
    const result = await flushOutbox(userId, { force: true })
    expect(result.sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('skips failed items at the retry cap unless force is set', async () => {
    await putOutboxWithAttachments(
      makeItem({ status: 'failed', retryCount: 5, lastError: 'boom' }),
      []
    )
    expect((await flushOutbox(userId)).sent).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()
    expect((await flushOutbox(userId, { force: true })).sent).toBe(1)
  })

  it('still sends on fakeApi when the stored JWT is expired', async () => {
    const { isJwtExpired } = jest.requireMock('../../auth/get-auth-token') as {
      isJwtExpired: jest.Mock
    }
    isJwtExpired.mockReturnValueOnce(true)

    await putOutboxWithAttachments(makeItem(), [])
    const result = await flushOutbox(userId)
    expect(result.pausedAuth).toBe(false)
    expect(result.sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('pauses on 401 and keeps the item pending', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    }) as unknown as typeof fetch

    await putOutboxWithAttachments(makeItem(), [])
    const result = await flushOutbox(userId)
    expect(result.pausedAuth).toBe(true)
    const items = await listOutbox(userId)
    expect(items).toHaveLength(1)
    expect(items[0]!.status).toBe('pending')
    expect(items[0]!.lastError).toBe('auth_expired')
  })

  it('marks the item failed on application-level error codes', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ error_code: 'E000500', error_msg: 'boom' }),
    }) as unknown as typeof fetch

    await putOutboxWithAttachments(makeItem(), [])
    const result = await flushOutbox(userId)
    expect(result.failed).toBe(1)
    const items = await listOutbox(userId)
    expect(items[0]!.status).toBe('failed')
    expect(items[0]!.lastError).toBe('boom')
    expect(items[0]!.retryCount).toBe(1)
  })

  it('does not double-send when called concurrently', async () => {
    await putOutboxWithAttachments(makeItem({ id: 'o2' }), [])
    const [a, b] = await Promise.all([flushOutbox(userId), flushOutbox(userId)])
    expect(a).toBe(b)
    expect(a.sent).toBe(1)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })

  it('skips items held for edit', async () => {
    resetOutboxEditHolds()
    await putOutboxWithAttachments(makeItem(), [])
    expect(await holdOutboxForEdit(userId, 'o1')).not.toBeNull()
    const result = await flushOutbox(userId)
    expect(result.sent).toBe(0)
    expect(await listOutbox(userId)).toHaveLength(1)
    expect(global.fetch).not.toHaveBeenCalled()
    resetOutboxEditHolds()
  })

  it('sends the item again once the edit hold is released', async () => {
    resetOutboxEditHolds()
    await putOutboxWithAttachments(makeItem(), [])
    await holdOutboxForEdit(userId, 'o1')
    releaseOutboxForEdit('o1', userId)
    await waitForHoldCleared('o1')
    expect((await flushOutbox(userId)).sent).toBe(1)
  })

  it('keeps an item pending (retry counted) when an upload fails at network level', async () => {
    await putOutboxWithAttachments(makeItem({ attachmentIds: ['a1'] }), [
      attachment('a1'),
    ])
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError('Failed to fetch')
      ) as unknown as typeof fetch

    const result = await flushOutbox(userId)
    expect(result.failed).toBe(1)
    expect(result.interrupted).toBe(0)
    const item = await getOutboxItem(userId, 'o1')
    expect(item?.status).toBe('pending')
    expect(item?.retryCount).toBe(1)
  })

  it('stops auto-retrying pre-send network failures at the retry cap', async () => {
    await putOutboxWithAttachments(
      makeItem({ retryCount: 4, attachmentIds: ['a1'] }),
      [attachment('a1')]
    )
    global.fetch = jest
      .fn()
      .mockRejectedValue(new TypeError('Failed')) as unknown as typeof fetch

    await flushOutbox(userId)
    const item = await getOutboxItem(userId, 'o1')
    expect(item?.status).toBe('failed')
    expect(item?.retryCount).toBe(5)
    ;(global.fetch as jest.Mock).mockClear()
    expect((await flushOutbox(userId)).failed).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('parks the item as interrupted when /send fails at network level', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    global.fetch = jest
      .fn()
      .mockRejectedValue(
        new TypeError('Failed to fetch')
      ) as unknown as typeof fetch

    const result = await flushOutbox(userId)
    expect(result.interrupted).toBe(1)
    const item = await getOutboxItem(userId, 'o1')
    expect(item?.status).toBe('failed')
    expect(item?.lastError).toBe('interrupted')
    expect(item?.retryCount).toBe(1)

    // Auto-flush must not resend a possibly delivered message…
    ;(global.fetch as jest.Mock).mockClear()
    expect((await flushOutbox(userId)).sent).toBe(0)
    expect(global.fetch).not.toHaveBeenCalled()

    // …only an explicit "Send all" does.
    global.fetch = jest
      .fn()
      .mockResolvedValue(okResponse()) as unknown as typeof fetch
    expect((await flushOutbox(userId, { force: true })).sent).toBe(1)
  })

  it('treats a gateway timeout on /send as an unknown outcome', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 504,
      json: async () => null,
    }) as unknown as typeof fetch

    const result = await flushOutbox(userId)
    expect(result.interrupted).toBe(1)
    expect((await getOutboxItem(userId, 'o1'))?.lastError).toBe('interrupted')
  })

  it('aborts a hung /send after the timeout and parks it as interrupted', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    global.fetch = jest.fn().mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError'))
          )
        })
    ) as unknown as typeof fetch

    const result = await flushOutbox(userId)
    expect(result.interrupted).toBe(1)
    expect((await getOutboxItem(userId, 'o1'))?.status).toBe('failed')
  })

  it('sizes upload timeouts with the file size', () => {
    expect(uploadTimeoutMs(25 * 1024 * 1024)).toBeGreaterThan(
      uploadTimeoutMs(1024)
    )
    expect(uploadTimeoutMs(0)).toBe(60_000)
  })

  it('persists upload progress so a retry neither re-uploads nor forks the draft', async () => {
    await putOutboxWithAttachments(makeItem({ attachmentIds: ['a1', 'a2'] }), [
      attachment('a1'),
      attachment('a2'),
    ])
    let uploads = 0
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/attachments')) {
        uploads += 1
        if (uploads === 2) {
          return { ok: false, status: 500, json: async () => ({}) }
        }
        return uploadResponse('tmp-key')
      }
      return okResponse()
    }) as unknown as typeof fetch

    const first = await flushOutbox(userId)
    expect(first.failed).toBe(1)
    const item = await getOutboxItem(userId, 'o1')
    expect(item?.mailKey).toBe('tmp-key')
    const stored = await getOutboxAttachments(userId, 'o1')
    expect(stored.filter((a) => a.uploaded)).toHaveLength(1)

    const retried = jest.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/attachments')) return uploadResponse('tmp-key')
      return okResponse()
    })
    global.fetch = retried as unknown as typeof fetch
    expect((await flushOutbox(userId)).sent).toBe(1)
    const urls = retried.mock.calls.map(([url]) => String(url))
    expect(urls).toEqual([
      '/fakeApi/mailboxes/0/mail/tmp-key/attachments',
      '/fakeApi/mailboxes/0/mail/tmp-key/send',
    ])
  })

  it('does not upload again attachments already on the server draft', async () => {
    await putOutboxWithAttachments(
      makeItem({ mailKey: 'draft-1', attachmentIds: ['a1', 'a2'] }),
      [{ ...attachment('a1'), uploaded: true }, attachment('a2')]
    )
    global.fetch = jest.fn().mockImplementation(async (url: string) => {
      if (String(url).includes('/attachments')) return uploadResponse('draft-1')
      return okResponse()
    }) as unknown as typeof fetch

    expect((await flushOutbox(userId)).sent).toBe(1)
    const urls = (global.fetch as jest.Mock).mock.calls.map(([url]) =>
      String(url)
    )
    expect(urls).toEqual([
      '/fakeApi/mailboxes/0/mail/draft-1/attachments',
      '/fakeApi/mailboxes/0/mail/draft-1/send',
    ])
  })

  it('skips an item held for edit while the flush is running', async () => {
    resetOutboxEditHolds()
    await putOutboxWithAttachments(makeItem({ id: 'o1', updatedAt: 2 }), [])
    await putOutboxWithAttachments(makeItem({ id: 'o2', updatedAt: 1 }), [])
    const gate = deferred()
    const sentSubjects: string[] = []
    global.fetch = jest
      .fn()
      .mockImplementation(async (_url: string, init: RequestInit) => {
        sentSubjects.push(JSON.parse(init.body as string).subject)
        if (sentSubjects.length === 1) await gate.promise
        return okResponse()
      }) as unknown as typeof fetch

    const flushing = flushOutbox(userId)
    await waitForCalls(1)
    expect(await holdOutboxForEdit(userId, 'o2')).not.toBeNull()
    gate.resolve()
    const result = await flushing

    expect(result.sent).toBe(1)
    expect(sentSubjects).toHaveLength(1)
    expect((await getOutboxItem(userId, 'o2'))?.status).toBe('pending')
    resetOutboxEditHolds()
  })

  it('sends the latest version of an item edited while the flush is running', async () => {
    await putOutboxWithAttachments(makeItem({ id: 'o1', updatedAt: 2 }), [])
    await putOutboxWithAttachments(makeItem({ id: 'o2', updatedAt: 1 }), [])
    const gate = deferred()
    const sentSubjects: string[] = []
    global.fetch = jest
      .fn()
      .mockImplementation(async (_url: string, init: RequestInit) => {
        sentSubjects.push(JSON.parse(init.body as string).subject)
        if (sentSubjects.length === 1) await gate.promise
        return okResponse()
      }) as unknown as typeof fetch

    const flushing = flushOutbox(userId)
    await waitForCalls(1)
    await putOutboxWithAttachments(
      makeItem({ id: 'o2', subject: 'Edited', updatedAt: Date.now() + 1 }),
      []
    )
    gate.resolve()
    await flushing

    expect(sentSubjects).toEqual(['S', 'Edited'])
  })

  it('queues a forced flush requested while an automatic one runs', async () => {
    await putOutboxWithAttachments(makeItem({ id: 'o1', updatedAt: 2 }), [])
    await putOutboxWithAttachments(
      makeItem({
        id: 'o2',
        status: 'failed',
        lastError: 'interrupted',
        updatedAt: 1,
      }),
      []
    )
    const gate = deferred()
    let calls = 0
    global.fetch = jest.fn().mockImplementation(async () => {
      calls += 1
      if (calls === 1) await gate.promise
      return okResponse()
    }) as unknown as typeof fetch

    const auto = flushOutbox(userId)
    const forced = flushOutbox(userId, { force: true })
    expect(forced).not.toBe(auto)
    expect(flushOutbox(userId, { force: true })).toBe(forced)
    gate.resolve()

    expect((await auto).sent).toBe(1)
    expect((await forced).sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('re-arms Background Sync when the browser went offline during a flush', async () => {
    await putOutboxWithAttachments(makeItem(), [])
    Object.defineProperty(navigator, 'onLine', {
      configurable: true,
      get: () => false,
    })
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch
    try {
      await flushOutbox(userId)
    } finally {
      Object.defineProperty(navigator, 'onLine', {
        configurable: true,
        get: () => true,
      })
    }
    expect(registerBackgroundSync).toHaveBeenCalled()
  })

  it('does not re-arm Background Sync while the browser reports online', async () => {
    ;(registerBackgroundSync as jest.Mock).mockClear()
    await putOutboxWithAttachments(makeItem(), [])
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch
    await flushOutbox(userId)
    expect(registerBackgroundSync).not.toHaveBeenCalled()
  })
})

function attachment(id: string): OutboxAttachmentRecord {
  return {
    id,
    outboxId: 'o1',
    name: `${id}.txt`,
    size: 4,
    type: 'text/plain',
    blob: new Blob(['data'], { type: 'text/plain' }),
  }
}

function uploadResponse(key: string) {
  return {
    ok: true,
    status: 200,
    json: async () => ({ error_code: 'S000000', data: { key } }),
  }
}

function deferred() {
  let resolve: () => void = () => {}
  const promise = new Promise<void>((r) => {
    resolve = r
  })
  return { promise, resolve }
}

async function waitForCalls(count: number) {
  for (let i = 0; i < 100; i += 1) {
    if ((global.fetch as jest.Mock).mock.calls.length >= count) return
    await new Promise((r) => setTimeout(r, 5))
  }
  throw new Error('fetch not called')
}

async function waitForHoldCleared(id: string) {
  for (let i = 0; i < 100; i += 1) {
    if ((await getOutboxItem(userId, id))?.editHeldAt == null) return
    await new Promise((r) => setTimeout(r, 5))
  }
  throw new Error('hold not cleared')
}
