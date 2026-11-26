import { capShareFiles } from '../../features/offline/share/pending-share'
import {
  isAcceptedShareType,
  isForeignFetchSite,
  isForeignShareRequest,
} from '../../features/offline/share/share-target-policy'
import { shareLocaleFromPathname } from '../sw-runtime'
import { isShareTargetRequest, shareRedirectPath } from '../sw-share'

const ORIGIN = 'https://sogo.example'

describe('isShareTargetRequest', () => {
  it('matches POST /en/share on this origin', () => {
    expect(
      isShareTargetRequest(
        { method: 'POST', url: `${ORIGIN}/en/share` },
        ORIGIN
      )
    ).toBe(true)
    expect(
      isShareTargetRequest(
        { method: 'POST', url: `${ORIGIN}/en/share/` },
        ORIGIN
      )
    ).toBe(true)
  })

  it('ignores GET and other paths', () => {
    expect(
      isShareTargetRequest({ method: 'GET', url: `${ORIGIN}/en/share` }, ORIGIN)
    ).toBe(false)
    expect(
      isShareTargetRequest(
        { method: 'POST', url: `${ORIGIN}/en/u/0/INBOX` },
        ORIGIN
      )
    ).toBe(false)
  })

  it('ignores other origins, unknown locales and nested /share paths', () => {
    for (const url of [
      'https://other.example/en/share',
      `${ORIGIN}/share`,
      `${ORIGIN}/xx/share`,
      `${ORIGIN}/fakeApi/calendars/1/share`,
      `${ORIGIN}/en/u/0/share`,
      `${ORIGIN}/en/share/extra`,
    ]) {
      expect(isShareTargetRequest({ method: 'POST', url }, ORIGIN)).toBe(false)
    }
  })
})

describe('shareRedirectPath', () => {
  it('sends errors to compose with a flag and rejections to the inbox', () => {
    expect(shareRedirectPath('en', 'ok')).toBe(
      '/en/u/0/INBOX?compose=1&share=1'
    )
    expect(shareRedirectPath('en', 'error')).toBe(
      '/en/u/0/INBOX?compose=1&share=1&share_error=1'
    )
    expect(shareRedirectPath('en', 'rejected')).toBe('/en/u/0/INBOX')
  })
})

describe('share target request guard', () => {
  const headers = (site?: string) => ({
    get: (name: string) =>
      name === 'sec-fetch-site' && site !== undefined ? site : null,
  })

  it('accepts browser-initiated shares', () => {
    expect(
      isForeignShareRequest({ headers: headers(), referrer: '' }, ORIGIN)
    ).toBe(false)
    expect(
      isForeignShareRequest(
        { headers: headers('none'), referrer: 'about:client' },
        ORIGIN
      )
    ).toBe(false)
    expect(
      isForeignShareRequest(
        { headers: headers(), referrer: `${ORIGIN}/en/u/0/INBOX` },
        ORIGIN
      )
    ).toBe(false)
  })

  it('rejects cross-origin referrers and foreign fetch sites', () => {
    expect(
      isForeignShareRequest(
        { headers: headers(), referrer: 'https://evil.example/page' },
        ORIGIN
      )
    ).toBe(true)
    expect(
      isForeignShareRequest(
        { headers: headers('cross-site'), referrer: '' },
        ORIGIN
      )
    ).toBe(true)
    expect(isForeignFetchSite('same-site')).toBe(true)
    expect(isForeignFetchSite('same-origin')).toBe(false)
    expect(isForeignFetchSite('none')).toBe(false)
    expect(isForeignFetchSite(null)).toBe(false)
  })
})

describe('isAcceptedShareType', () => {
  it('follows the manifest accept list', () => {
    expect(isAcceptedShareType('image/png')).toBe(true)
    expect(isAcceptedShareType('application/pdf')).toBe(true)
    expect(isAcceptedShareType('text/plain; charset=utf-8')).toBe(true)
    expect(isAcceptedShareType('application/x-msdownload')).toBe(false)
    expect(isAcceptedShareType('image/')).toBe(false)
    expect(isAcceptedShareType('')).toBe(false)
  })
})

describe('shareLocaleFromPathname', () => {
  it('does not treat "share" as a locale', () => {
    expect(shareLocaleFromPathname('/share')).toBe('en')
  })
})

describe('capShareFiles', () => {
  it('drops files over the per-file and total byte caps', () => {
    const small = { size: 10 }
    const huge = { size: 26 * 1024 * 1024 }
    expect(capShareFiles([huge, small, small])).toEqual([small, small])
  })
})
