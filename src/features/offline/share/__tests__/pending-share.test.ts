/**
 * @jest-environment jsdom
 */
import 'fake-indexeddb/auto'

if (typeof globalThis.structuredClone !== 'function') {
  globalThis.structuredClone = <T>(value: T): T =>
    JSON.parse(JSON.stringify(value)) as T
}

import { SHARE_SESSION_KEY, consumeShareSession } from '../pending-share'
import { buildShareFallbackHtml } from '../share-fallback-html'

describe('share session fallback', () => {
  afterEach(() => {
    sessionStorage.clear()
  })

  it('reads and clears sessionStorage', () => {
    sessionStorage.setItem(
      SHARE_SESSION_KEY,
      JSON.stringify({ subject: 'Hi', body: 'Hello', url: 'https://x' })
    )
    expect(consumeShareSession()).toMatchObject({
      subject: 'Hi',
      body: 'Hello',
      url: 'https://x',
      files: [],
    })
    expect(sessionStorage.getItem(SHARE_SESSION_KEY)).toBeNull()
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
  })
})
