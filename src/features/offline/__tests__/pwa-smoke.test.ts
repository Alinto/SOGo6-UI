import fs from 'fs'
import path from 'path'

describe('PWA smoke assets', () => {
  it('ships required icon files', () => {
    const icons = [
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/icon-maskable-512.png',
      'public/icons/splash-light-1170x2532.png',
      'public/icons/splash-dark-1170x2532.png',
      'public/icons/splash-light-1290x2796.png',
      'public/icons/splash-dark-1290x2796.png',
    ]
    for (const rel of icons) {
      expect(fs.existsSync(path.join(process.cwd(), rel))).toBe(true)
    }
  })

  it('defines a web app manifest module', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/manifest.ts'))).toBe(
      true
    )
  })

  it('defines a service worker source', () => {
    expect(fs.existsSync(path.join(process.cwd(), 'src/app/sw.ts'))).toBe(true)
  })
})

describe('PWA manifest start_url', () => {
  it('prefixes start_url and shortcuts with the default locale', async () => {
    const { default: manifest } = await import('@/app/manifest')
    const { pwaStartUrl } = await import('../pwa-start-url')

    const m = manifest()
    const startUrl = pwaStartUrl()

    expect(startUrl).toBe('/en/u/0/INBOX')
    expect(m.start_url).toBe(startUrl)
    expect(m.start_url).not.toBe('/')
    expect(m.shortcuts?.map((s) => s.url)).toEqual([
      '/en/u/0/INBOX',
      '/en/u/0/INBOX?compose=1',
    ])
    expect(
      (m as { share_target?: { action: string } }).share_target?.action
    ).toBe('/en/share')
    expect(
      (m as { protocol_handlers?: { protocol: string }[] })
        .protocol_handlers?.[0]?.protocol
    ).toBe('mailto')
  })
})
