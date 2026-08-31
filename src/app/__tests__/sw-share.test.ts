import { capShareFiles } from '../../features/offline/share/pending-share'
import { shareLocaleFromPathname } from '../sw-runtime'
import { isShareTargetRequest } from '../sw-share'

describe('isShareTargetRequest', () => {
  it('matches POST /en/share', () => {
    expect(
      isShareTargetRequest({
        method: 'POST',
        url: 'https://sogo.example/en/share',
      })
    ).toBe(true)
  })

  it('ignores GET and other paths', () => {
    expect(
      isShareTargetRequest({
        method: 'GET',
        url: 'https://sogo.example/en/share',
      })
    ).toBe(false)
    expect(
      isShareTargetRequest({
        method: 'POST',
        url: 'https://sogo.example/en/u/0/INBOX',
      })
    ).toBe(false)
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
