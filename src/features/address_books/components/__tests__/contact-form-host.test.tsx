import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

const mockUseAddressBookState = jest.fn()
const mockUseAddressBookEditState = jest.fn()

jest.mock('../../hooks/use-address-book-state', () => ({
  useAddressBookState: () => mockUseAddressBookState(),
  useAddressBookEditState: () => mockUseAddressBookEditState(),
}))

jest.mock('../../store/address-books-api', () => ({
  useAddVCardToAddressBookMutation: () => [jest.fn(), { isLoading: false }],
  useUpdateVCardMutation: () => [jest.fn(), { isLoading: false }],
}))

jest.mock('../contact-form', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="contact-form">
      {props.isLoading ? 'loading' : 'ready'}
      {props.isSubmitting ? '-submitting' : ''}
    </div>
  ),
  fromFieldArray: jest.fn(),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
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
})
