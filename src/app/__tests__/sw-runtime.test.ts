import {
  filterPrecacheEntries,
  isAuthLoginPath,
  isBrokenPrecacheUrl,
  isNavigationRequest,
  offlineFallbackPath,
  offlineLoginPath,
} from '../sw-runtime'

describe('isNavigationRequest', () => {
  it('matches mode navigate even when destination is empty', () => {
    expect(isNavigationRequest({ mode: 'navigate', destination: '' })).toBe(
      true
    )
  })

  it('matches document destination', () => {
    expect(isNavigationRequest({ mode: 'cors', destination: 'document' })).toBe(
      true
    )
  })

  it('ignores script fetches', () => {
    expect(isNavigationRequest({ mode: 'cors', destination: 'script' })).toBe(
      false
    )
  })
})

describe('isBrokenPrecacheUrl', () => {
  it('drops missing public font paths and robots.txt', () => {
    expect(isBrokenPrecacheUrl('/fonts/OpenDyslexic-Regular.otf')).toBe(true)
    expect(isBrokenPrecacheUrl('/fonts/OpenDyslexic-Bold-Italic.otf')).toBe(
      true
    )
    expect(isBrokenPrecacheUrl('/robots.txt')).toBe(true)
    expect(
      isBrokenPrecacheUrl('http://localhost:3000/fonts/OpenDyslexic-Bold.otf')
    ).toBe(true)
  })

  it('keeps hashed next/font files and the offline fallback', () => {
    expect(
      isBrokenPrecacheUrl('/_next/static/media/OpenDyslexic-Regular.abc.otf')
    ).toBe(false)
    expect(isBrokenPrecacheUrl('/~offline')).toBe(false)
    expect(isBrokenPrecacheUrl('/en/~offline')).toBe(false)
    expect(isBrokenPrecacheUrl('/icons/icon-192.png')).toBe(false)
  })
})

describe('filterPrecacheEntries', () => {
  it('removes broken entries from the manifest', () => {
    expect(
      filterPrecacheEntries([
        { url: '/~offline' },
        { url: '/robots.txt' },
        '/fonts/OpenDyslexic-Italic.otf',
        { url: '/en/~offline' },
      ])
    ).toEqual([{ url: '/~offline' }, { url: '/en/~offline' }])
  })
})

describe('offlineFallbackPath', () => {
  it('uses the locale-prefixed fallback for known locales', () => {
    expect(offlineFallbackPath('https://sogo.example/fr/u/0/INBOX')).toBe(
      '/fr/~offline'
    )
    expect(offlineFallbackPath('https://sogo.example/de/calendars')).toBe(
      '/de/~offline'
    )
    expect(offlineFallbackPath('/es/~offline')).toBe('/es/~offline')
  })

  it('falls back to the unlocalized page for unknown paths', () => {
    expect(offlineFallbackPath('https://sogo.example/u/0/INBOX')).toBe(
      '/~offline'
    )
    expect(offlineFallbackPath('not a url')).toBe('/~offline')
  })
})

describe('isAuthLoginPath', () => {
  it('matches locale-prefixed login documents', () => {
    expect(isAuthLoginPath('/en/auth/login')).toBe(true)
    expect(isAuthLoginPath('/fr/auth/login/')).toBe(true)
    expect(isAuthLoginPath('/en/auth/login/pwd')).toBe(false)
    expect(isAuthLoginPath('/en/~offline')).toBe(false)
  })
})

describe('offlineLoginPath', () => {
  it('uses the locale-prefixed login page', () => {
    expect(offlineLoginPath('https://sogo.example/fr/u/0/INBOX')).toBe(
      '/fr/auth/login'
    )
    expect(offlineLoginPath('https://sogo.example/de/calendars')).toBe(
      '/de/auth/login'
    )
  })

  it('defaults to English when the path has no locale', () => {
    expect(offlineLoginPath('https://sogo.example/u/0/INBOX')).toBe(
      '/en/auth/login'
    )
    expect(offlineLoginPath('not a url')).toBe('/en/auth/login')
  })
})
