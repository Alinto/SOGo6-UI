import { pwaStartUrl } from '../pwa-start-url'

describe('pwaStartUrl', () => {
  it('prefixes the inbox path with the default locale', () => {
    expect(pwaStartUrl()).toBe('/en/u/0/INBOX')
  })

  it('prefixes with an explicit locale', () => {
    expect(pwaStartUrl('fr')).toBe('/fr/u/0/INBOX')
  })
})
