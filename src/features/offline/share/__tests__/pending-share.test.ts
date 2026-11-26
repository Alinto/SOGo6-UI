/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import {
  PENDING_SHARE_TTL_MS,
  SHARE_SESSION_KEY,
  consumePendingShare,
  consumeShareSession,
  isPendingShareFresh,
  savePendingShare,
} from '../pending-share'
import { buildShareFallbackHtml } from '../share-fallback-html'

describe('share session fallback', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('reads and clears sessionStorage', () => {
    sessionStorage.setItem(
      SHARE_SESSION_KEY,
      JSON.stringify({
        subject: 'Hi',
        body: 'Hello',
        url: 'https://x',
        createdAt: Date.now(),
      })
    )
    expect(consumeShareSession()).toMatchObject({
      subject: 'Hi',
      body: 'Hello',
      url: 'https://x',
      files: [],
    })
    expect(sessionStorage.getItem(SHARE_SESSION_KEY)).toBeNull()
  })

  it('drops an expired or undated session share', () => {
    sessionStorage.setItem(
      SHARE_SESSION_KEY,
      JSON.stringify({
        subject: 'Old',
        createdAt: Date.now() - PENDING_SHARE_TTL_MS - 1,
      })
    )
    expect(consumeShareSession()).toBeNull()
    expect(sessionStorage.getItem(SHARE_SESSION_KEY)).toBeNull()

    sessionStorage.setItem(SHARE_SESSION_KEY, JSON.stringify({ subject: 'X' }))
    expect(consumeShareSession()).toBeNull()
  })
})

describe('pending share TTL', () => {
  it('isPendingShareFresh honours the TTL', () => {
    const now = 1_000_000_000
    expect(isPendingShareFresh(now - 1000, now)).toBe(true)
    expect(isPendingShareFresh(now - PENDING_SHARE_TTL_MS - 1, now)).toBe(false)
    expect(isPendingShareFresh(now + 60_000, now)).toBe(false)
    expect(isPendingShareFresh(undefined, now)).toBe(false)
  })

  it('consumes a fresh IndexedDB share once', async () => {
    await savePendingShare({
      to: '',
      subject: 'S',
      body: 'B',
      url: '',
      files: [],
    })
    expect(await consumePendingShare()).toMatchObject({
      subject: 'S',
      body: 'B',
    })
    expect(await consumePendingShare()).toBeNull()
  })

  it('discards a stale IndexedDB share', async () => {
    await savePendingShare({
      to: '',
      subject: 'stale',
      body: '',
      url: '',
      files: [],
      createdAt: Date.now() - PENDING_SHARE_TTL_MS - 1,
    })
    expect(await consumePendingShare()).toBeNull()
  })
})

describe('buildShareFallbackHtml', () => {
  it('does not put the body in the redirect URL', () => {
    const html = buildShareFallbackHtml(
      'https://sogo.example/en/u/0/INBOX?compose=1&share=1',
      { subject: 'S', body: 'secret', url: '' }
    )
    expect(html).toContain('sogo_pending_share')
    expect(html).toContain('secret')
    expect(html).not.toContain('subject=')
    expect(html).toContain('createdAt=Date.now()')
  })
})
