import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import RecipientContactCard from '../recipient-contact-card'

const mockUseSearchAllContactsQuery = jest.fn()
const mockDispatch = jest.fn()
const mockGetAddressBookPermissions = jest.fn()
const mockAddressBooks = {
  personals: [{ id: 'personal', default: true }],
  subscriptions: [],
  globals: [],
}

jest.mock('../../store/address-books-api', () => ({
  useSearchAllContactsQuery: (...args: unknown[]) =>
    mockUseSearchAllContactsQuery(...args),
  useGetAddressBooksQuery: () => ({ data: mockAddressBooks }),
}))

jest.mock('../../store/address-books-ui-slice', () => ({
  openEditForm: (payload: unknown) => ({ type: 'openEditForm', payload }),
  openCreateForm: (payload: unknown) => ({ type: 'openCreateForm', payload }),
  selectBookRights: () => undefined,
}))

jest.mock('../../utils/address-book-permissions', () => ({
  getAddressBookPermissions: (...args: unknown[]) =>
    mockGetAddressBookPermissions(...args),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => selector({}),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Radix only renders the image once it has loaded, which never happens in
// jsdom.
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AvatarImage: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <span data-testid="avatar-fallback">{children}</span>
  ),
}))

const contact = {
  id: '1',
  firstName: 'Jean',
  lastName: 'Dupont',
  emails: ['jean.dupont@example.com'],
  structuredPhones: [{ number: '+33 1 23 45 67 89' }],
  photo: 'https://example.com/jean.png',
  addressBookKey: 'personal',
}

describe('RecipientContactCard', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockGetAddressBookPermissions.mockReturnValue({ canEdit: true })
  })

  it('looks the contact up by email', () => {
    mockUseSearchAllContactsQuery.mockReturnValue({ isLoading: true })
    render(<RecipientContactCard email="jean.dupont@example.com" />)
    expect(mockUseSearchAllContactsQuery).toHaveBeenCalledWith({
      params: { search: 'jean.dupont@example.com', page: 1, page_size: 5 },
    })
  })

  it('shows the name, email, phone and photo of the matching contact', () => {
    mockUseSearchAllContactsQuery.mockReturnValue({
      data: {
        items: [
          { ...contact, id: '2', emails: ['other@example.com'] },
          contact,
        ],
      },
      isLoading: false,
    })
    render(
      <RecipientContactCard email="Jean.Dupont@example.com" name="Jean D." />
    )

    expect(screen.getByText('Jean Dupont')).toBeInTheDocument()
    expect(screen.getByText('Jean.Dupont@example.com')).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /\+33 1 23 45 67 89/ })
    ).toHaveAttribute('href', 'tel:+33 1 23 45 67 89')
    expect(screen.getByRole('img', { name: 'Jean Dupont' })).toHaveAttribute(
      'src',
      'https://example.com/jean.png'
    )
  })

  it('falls back to the known name and initials when no contact matches', () => {
    mockUseSearchAllContactsQuery.mockReturnValue({
      data: { items: [] },
      isLoading: false,
    })
    render(<RecipientContactCard email="bob@example.com" name="Bob Martin" />)

    expect(screen.getByText('Bob Martin')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('BM')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('shows only the email when the lookup fails and no name is known', () => {
    mockUseSearchAllContactsQuery.mockReturnValue({
      isError: true,
      isLoading: false,
    })
    render(<RecipientContactCard email="typed@example.com" />)

    expect(screen.getByText('typed@example.com')).toBeInTheDocument()
    expect(screen.getByTestId('avatar-fallback')).toHaveTextContent('TE')
  })

  describe('edit button', () => {
    it('opens the contact edit form', () => {
      mockUseSearchAllContactsQuery.mockReturnValue({
        data: { items: [contact] },
        isLoading: false,
      })
      render(<RecipientContactCard email="jean.dupont@example.com" />)

      fireEvent.click(screen.getByRole('button', { name: 'edit.string' }))
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'openEditForm',
        payload: { contactId: '1', bookId: 'personal' },
      })
    })

    it('is hidden when the address book is read-only', () => {
      mockGetAddressBookPermissions.mockReturnValue({ canEdit: false })
      mockUseSearchAllContactsQuery.mockReturnValue({
        data: { items: [contact] },
        isLoading: false,
      })
      render(<RecipientContactCard email="jean.dupont@example.com" />)

      expect(
        screen.queryByRole('button', { name: 'edit.string' })
      ).not.toBeInTheDocument()
    })

    it('is hidden when no contact matches', () => {
      mockUseSearchAllContactsQuery.mockReturnValue({
        data: { items: [] },
        isLoading: false,
      })
      render(<RecipientContactCard email="bob@example.com" />)

      expect(
        screen.queryByRole('button', { name: 'edit.string' })
      ).not.toBeInTheDocument()
    })
  })

  describe('add to contacts button', () => {
    const addLabel =
      'mail_display.header.contacts-badge.popover-add-to-addressbook.string'

    it('opens the create form prefilled for an unknown address', () => {
      mockUseSearchAllContactsQuery.mockReturnValue({
        data: { items: [] },
        isLoading: false,
      })
      render(
        <RecipientContactCard email="new@example.com" name="Marie Curie" />
      )

      expect(
        screen.queryByRole('button', { name: 'edit.string' })
      ).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: addLabel }))
      expect(mockDispatch).toHaveBeenCalledWith({
        type: 'openCreateForm',
        payload: {
          bookId: 'personal',
          prefill: {
            firstName: 'Marie',
            lastName: 'Curie',
            emails: ['new@example.com'],
          },
          openContactAfterCreate: false,
        },
      })
    })

    it('is hidden for a known contact', () => {
      mockUseSearchAllContactsQuery.mockReturnValue({
        data: { items: [contact] },
        isLoading: false,
      })
      render(<RecipientContactCard email="jean.dupont@example.com" />)

      expect(
        screen.queryByRole('button', { name: addLabel })
      ).not.toBeInTheDocument()
    })

    it('is hidden while the contact is being looked up', () => {
      mockUseSearchAllContactsQuery.mockReturnValue({ isLoading: true })
      render(<RecipientContactCard email="new@example.com" />)

      expect(
        screen.queryByRole('button', { name: addLabel })
      ).not.toBeInTheDocument()
    })
  })
})
