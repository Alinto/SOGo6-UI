/**
 * Builds the CardDAV-style URL for an address book (dev/fakeAPI placeholder).
 */
export function buildAddressBookDavUrl(bookId: string): string {
  const base =
    typeof window !== 'undefined'
      ? window.location.origin
      : ''
  return `${base}/SOGo/dav/addressbooks/${encodeURIComponent(bookId)}/`
}
