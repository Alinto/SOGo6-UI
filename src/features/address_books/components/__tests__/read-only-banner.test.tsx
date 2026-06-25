import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: { name?: string }) =>
    params?.name ? `${key}:${params.name}` : key,
}))

const mockUseActiveAddressBookWritable = jest.fn()

jest.mock('../../hooks/use-active-address-book', () => ({
  useActiveAddressBookWritable: () => mockUseActiveAddressBookWritable(),
}))

import ReadOnlyBanner from '../read-only-banner'

describe('ReadOnlyBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when book is writable', () => {
    mockUseActiveAddressBookWritable.mockReturnValue({
      writable: true,
      book: { id: 'work', name: 'Work', type: 'personal' },
    })

    const { container } = render(<ReadOnlyBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders banner for non-writable book', () => {
    mockUseActiveAddressBookWritable.mockReturnValue({
      writable: false,
      book: { id: 'ldap', name: 'Directory', type: 'global' },
    })

    render(<ReadOnlyBanner />)
    expect(screen.getByTestId('address-book-read-only-banner')).toHaveTextContent(
      'read_only_banner.string:Directory'
    )
  })
})
