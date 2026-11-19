import '@testing-library/jest-dom'
import { act, render, screen } from '@testing-library/react'

const mockUseAddressBookState = jest.fn()
const mockUpdateContact = jest.fn()
const mockAddContact = jest.fn()
let capturedOnSubmit:
  | ((values: Record<string, unknown>, contactId?: string) => Promise<void>)
  | undefined
const mockUseAddressBookEditState = jest.fn()

jest.mock('../../hooks/use-address-book-state', () => ({
  useAddressBookState: () => mockUseAddressBookState(),
  useAddressBookEditState: () => mockUseAddressBookEditState(),
}))

jest.mock('../../store/address-books-api', () => ({
  useAddVCardToAddressBookMutation: () => [
    mockAddContact,
    { isLoading: false },
  ],
  useUpdateVCardMutation: () => [mockUpdateContact, { isLoading: false }],
}))

jest.mock('../contact-form', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    capturedOnSubmit = props.onSubmit as typeof capturedOnSubmit
    return (
      <div data-testid="contact-form">
        {props.isLoading ? 'loading' : 'ready'}
        {props.isSubmitting ? '-submitting' : ''}
      </div>
    )
  },
  fromFieldArray: (rows?: { value: string }[]) =>
    (rows ?? []).map((row) => row.value).filter(Boolean),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
  useAppSelector: (
    selector: (state: {
      addressBooksUi: { rightsByBook: Record<string, never> }
    }) => unknown
  ) => selector({ addressBooksUi: { rightsByBook: {} } }),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

import ContactFormHost from '../contact-form-host'

describe('ContactFormHost', () => {
  beforeEach(() => {
    mockUseAddressBookState.mockReturnValue({
      routeBookId: 'work',
      activeBookId: 'work',
      ui: {
        isFormOpen: true,
        editingContactId: 'c1',
        prefillContact: null,
      },
    })
    mockUseAddressBookEditState.mockReturnValue({
      editingEntity: undefined,
      isEditLoading: true,
      isEditLoadError: false,
    })
  })

  it('shows loading state while editing contact is fetched', () => {
    render(<ContactFormHost />)
    expect(screen.getByTestId('contact-form')).toHaveTextContent('loading')
  })

  it('renders ready form when not loading', () => {
    mockUseAddressBookEditState.mockReturnValue({
      editingEntity: { id: 'c1', firstName: 'John', lastName: 'Doe' },
      isEditLoading: false,
      isEditLoadError: false,
    })

    render(<ContactFormHost />)
    expect(screen.getByTestId('contact-form')).toHaveTextContent('ready')
  })

  describe('submitting the form', () => {
    const emptiedValues = {
      bookId: 'work',
      contactKind: 'individual',
      name: '',
      firstName: 'John',
      lastName: 'Doe',
      middleName: '',
      prefix: '',
      suffix: '',
      nickname: '',
      organization: '',
      department: '',
      jobTitle: '',
      title: '',
      emails: [],
      phoneNumbers: [],
      addresses: [],
      urls: [],
      impp: [],
      birthday: '',
      birthdayUnknownYear: false,
      anniversary: '',
      categories: [],
      photoDataUri: undefined,
      clearPhoto: false,
      note: '',
    }

    beforeEach(() => {
      mockUpdateContact.mockReset()
      mockAddContact.mockReset()
      mockUpdateContact.mockReturnValue({ unwrap: () => Promise.resolve({}) })
      mockAddContact.mockReturnValue({
        unwrap: () => Promise.resolve({ id: 'new' }),
      })
      mockUseAddressBookEditState.mockReturnValue({
        editingEntity: { id: 'c1', firstName: 'John', lastName: 'Doe' },
        isEditLoading: false,
        isEditLoadError: false,
      })
    })

    it('sends emptied fields when editing so the server clears them', async () => {
      render(<ContactFormHost />)
      await act(() => capturedOnSubmit!(emptiedValues, 'c1'))

      expect(mockUpdateContact).toHaveBeenCalledWith(
        expect.objectContaining({
          patchBody: expect.objectContaining({
            emails: [],
            phones: [],
            addresses: [],
            note: null,
            organization: null,
            job_title: null,
          }),
        })
      )
    })

    it('leaves emptied fields out when creating', async () => {
      render(<ContactFormHost />)
      await act(() => capturedOnSubmit!(emptiedValues))

      const { createBody } = mockAddContact.mock.calls[0][0]
      expect(JSON.parse(JSON.stringify(createBody))).not.toHaveProperty(
        'emails'
      )
      expect(createBody.note).toBeUndefined()
    })
  })
})
