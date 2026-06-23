import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

const mockUseAddressBookState = jest.fn()
const mockUseAddressBookEditState = jest.fn()

jest.mock('../../hooks/use-address-book-state', () => ({
  useAddressBookState: () => mockUseAddressBookState(),
  useAddressBookEditState: () => mockUseAddressBookEditState(),
}))

jest.mock('../../hooks/use-address-book-contact-picker', () => ({
  useAddressBookContactPicker: () => ({
    contacts: [],
    isLoading: false,
  }),
}))

jest.mock('../../store/address-books-api', () => ({
  useAddVCardToAddressBookMutation: () => [jest.fn(), { isLoading: false }],
  useUpdateVCardMutation: () => [jest.fn(), { isLoading: false }],
}))

jest.mock('../distribution-list-form', () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => (
    <div data-testid="distribution-list-form">
      {props.isLoading ? 'loading' : 'ready'}
      {props.isSubmitting ? '-submitting' : ''}
    </div>
  ),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => jest.fn(),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import DistributionListFormHost from '../distribution-list-form-host'

describe('DistributionListFormHost', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseAddressBookState.mockReturnValue({
      activeBookId: 'work',
      ui: {
        isListFormOpen: true,
        editingListId: 'list-1',
        prefillListMembers: null,
      },
    })
    mockUseAddressBookEditState.mockReturnValue({
      editingEntity: undefined,
      isEditLoading: true,
      isEditLoadError: false,
    })
  })

  describe('basic rendering', () => {
    it('shows loading state while editing list is fetched', () => {
      render(<DistributionListFormHost />)
      expect(screen.getByTestId('distribution-list-form')).toHaveTextContent('loading')
    })

    it('renders ready form when not loading', () => {
      mockUseAddressBookEditState.mockReturnValue({
        editingEntity: { id: 'list-1', firstName: 'Team', lastName: '' },
        isEditLoading: false,
        isEditLoadError: false,
      })

      render(<DistributionListFormHost />)
      expect(screen.getByTestId('distribution-list-form')).toHaveTextContent('ready')
    })
  })

  describe('configuration', () => {
    it('returns null when form is open without active book', () => {
      mockUseAddressBookState.mockReturnValue({
        activeBookId: null,
        ui: { isListFormOpen: true, editingListId: null, prefillListMembers: null },
      })

      const { container } = render(<DistributionListFormHost />)
      expect(container).toBeEmptyDOMElement()
    })
  })
})
