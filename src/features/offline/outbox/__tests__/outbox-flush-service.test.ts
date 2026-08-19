/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { listOutbox, upsertOutboxItem } from '../../db/outbox-store'
import { wipeOfflineUserData } from '../../db/wipe'
import type { OutboxRecord } from '../../types'
import { flushOutbox } from '../outbox-flush-service'

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => true,
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
    await upsertOutboxItem(makeItem())
    const result = await flushOutbox(userId)
    expect(result.sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('POSTs the SendMailBody contract to the resolved API base', async () => {
    await upsertOutboxItem(makeItem())
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
    await upsertOutboxItem(makeItem({ mailKey: 'draft-42' }))
    await flushOutbox(userId)
    const [url] = (global.fetch as jest.Mock).mock.calls[0] as [string]
    expect(url).toBe('/fakeApi/mailboxes/0/mail/draft-42/send')
  })

  it('recovers items stuck in sending state', async () => {
    await upsertOutboxItem(makeItem({ status: 'sending' }))
    const result = await flushOutbox(userId)
    expect(result.sent).toBe(1)
    expect(await listOutbox(userId)).toHaveLength(0)
  })

  it('still sends on fakeApi when the stored JWT is expired', async () => {
    const { isJwtExpired } = jest.requireMock('../../auth/get-auth-token') as {
      isJwtExpired: jest.Mock
    }
    isJwtExpired.mockReturnValueOnce(true)

    await upsertOutboxItem(makeItem())
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

    await upsertOutboxItem(makeItem())
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

    await upsertOutboxItem(makeItem())
    const result = await flushOutbox(userId)
    expect(result.failed).toBe(1)
    const items = await listOutbox(userId)
    expect(items[0]!.status).toBe('failed')
    expect(items[0]!.lastError).toBe('boom')
    expect(items[0]!.retryCount).toBe(1)
  })

  it('does not double-send when called concurrently', async () => {
    await upsertOutboxItem(makeItem({ id: 'o2' }))
    const [a, b] = await Promise.all([flushOutbox(userId), flushOutbox(userId)])
    expect(a).toBe(b)
    expect(a.sent).toBe(1)
    expect(global.fetch).toHaveBeenCalledTimes(1)
  })
})
