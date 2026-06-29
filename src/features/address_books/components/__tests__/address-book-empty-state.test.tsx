import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import { openCreateForm } from '../../store/address-books-ui-slice'
import AddressBookEmptyState from '../address-book-empty-state'

describe('AddressBookEmptyState', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders empty state variant', () => {
      render(<AddressBookEmptyState variant="empty" bookId="work" />)
      expect(screen.getByTestId('address-book-empty-state')).toBeInTheDocument()
      expect(screen.getByText('empty_title.string')).toBeInTheDocument()
    })

    it('renders search empty variant', () => {
      render(<AddressBookEmptyState variant="search" />)
      expect(screen.getByTestId('address-book-search-empty')).toBeInTheDocument()
      expect(screen.getByText('search_empty_title.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('dispatches openCreateForm when create button is clicked', async () => {
      const user = userEvent.setup()
      render(<AddressBookEmptyState variant="empty" bookId="work" />)

      await user.click(screen.getByRole('button', { name: 'empty_create_contact.string' }))

      expect(mockDispatch).toHaveBeenCalledWith(openCreateForm({ bookId: 'work' }))
    })

    it('hides create button when showCreateAction is false', () => {
      render(
        <AddressBookEmptyState
          variant="empty"
          bookId="work"
          showCreateAction={false}
        />
      )
      expect(
        screen.queryByRole('button', { name: 'empty_create_contact.string' })
      ).not.toBeInTheDocument()
    })

    it('calls onClearSearch when clear button is clicked', async () => {
      const user = userEvent.setup()
      const onClearSearch = jest.fn()
      render(
        <AddressBookEmptyState variant="search" onClearSearch={onClearSearch} />
      )

      await user.click(screen.getByRole('button', { name: 'clear_search.string' }))

      expect(onClearSearch).toHaveBeenCalledTimes(1)
    })
  })
})
