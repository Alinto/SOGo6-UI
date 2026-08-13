import fs from 'fs'
import path from 'path'

describe('PWA smoke assets', () => {
  it('ships required icon files', () => {
    const icons = [
      'public/icons/icon-192.png',
      'public/icons/icon-512.png',
      'public/icons/icon-maskable-512.png',
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
