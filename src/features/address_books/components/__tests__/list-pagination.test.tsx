import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import AddressBookListPagination from '../list-pagination'

const mockDispatch = jest.fn()

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ addressBooksUi: { page: 1 } }),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({
    children,
    onClick,
    disabled,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    'aria-label'?: string
  }) => (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={ariaLabel}>
      {children}
    </button>
  ),
}))

describe('AddressBookListPagination', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('returns null when only one page and page size hidden', () => {
      const { container } = render(
        <AddressBookListPagination
          totalPages={1}
          currentPage={1}
          showPageSize={false}
        />
      )
      expect(container).toBeEmptyDOMElement()
    })

    it('renders page size selector when enabled', () => {
      render(
        <AddressBookListPagination totalPages={1} currentPage={1} showPageSize />
      )
      expect(screen.getByText('pagination.page_size.string')).toBeInTheDocument()
    })

    it('renders pagination controls when multiple pages', () => {
      render(<AddressBookListPagination totalPages={3} currentPage={2} />)
      expect(screen.getByLabelText('pagination.previous.string')).toBeInTheDocument()
      expect(screen.getByLabelText('pagination.next.string')).toBeInTheDocument()
      expect(screen.getByText('pagination.page.string')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('disables previous button on first page', () => {
      render(<AddressBookListPagination totalPages={3} currentPage={1} />)
      expect(screen.getByLabelText('pagination.previous.string')).toBeDisabled()
      expect(screen.getByLabelText('pagination.next.string')).not.toBeDisabled()
    })

    it('disables next button on last page', () => {
      render(<AddressBookListPagination totalPages={3} currentPage={3} />)
      expect(screen.getByLabelText('pagination.next.string')).toBeDisabled()
      expect(screen.getByLabelText('pagination.previous.string')).not.toBeDisabled()
    })
  })

  describe('integration', () => {
    it('dispatches setPage when next is clicked', () => {
      render(<AddressBookListPagination totalPages={3} currentPage={1} />)
      fireEvent.click(screen.getByLabelText('pagination.next.string'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('setPage') })
      )
    })

    it('dispatches setPage when previous is clicked', () => {
      render(<AddressBookListPagination totalPages={3} currentPage={2} />)
      fireEvent.click(screen.getByLabelText('pagination.previous.string'))
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: expect.stringContaining('setPage') })
      )
    })
  })
})
