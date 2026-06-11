import { buildAddressBookDavUrl } from '../address-book-url'

describe('buildAddressBookDavUrl', () => {
  it('builds a CardDAV URL with encoded book id', () => {
    const url = buildAddressBookDavUrl('my book')
    expect(url).toContain('/SOGo/dav/addressbooks/')
    expect(url).toContain(encodeURIComponent('my book'))
  })
})
