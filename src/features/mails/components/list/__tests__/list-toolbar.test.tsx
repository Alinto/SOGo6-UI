import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import ListToolbar from '../list-toolbar'

jest.mock('@/features/mails/hooks/use-mail-item-actions', () => ({
  useMailItemActions: jest.fn(() => ({
    deleteMail: jest.fn(),
    archiveMail: jest.fn(),
    toggleRead: jest.fn(),
    markSpam: jest.fn(),
    isJunk: false,
  })),
}))

jest.mock('@/features/mails/hooks/use-folder-messages', () => ({
  useFolderMessages: jest.fn(() => ({
    data: {
      mails: [
        { id: '1', subject: 'Test' },
        { id: '2', subject: 'Test 2' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
    currentPage: 1,
    params: {},
  })),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetFolderMessagesQuery: jest.fn(() => ({
    data: {
      mails: [
        { id: '1', subject: 'Test' },
        { id: '2', subject: 'Test 2' },
      ],
      total: 2,
      page: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    isLoading: false,
  })),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({ folder: 'INBOX', account: '0' })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn((fn: (s: any) => any) =>
    fn({ mailLayout: { selectedMailIds: [] }, mailNavigation: { skipFolderFetch: false } })
  ),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      data-testid="checkbox"
      type="checkbox"
      checked={checked === true}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

jest.mock('@/features/mails/components/mail/mail-action-bar', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-actions-bar" />,
}))

jest.mock('../list-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter" />,
}))

jest.mock('../list-filter-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter-dropdown" />,
}))

jest.mock('../list-sort', () => ({
  __esModule: true,
  default: () => <div data-testid="list-sort" />,
}))

jest.mock('../list-pagination', () => ({
  __esModule: true,
  default: () => <div data-testid="list-pagination" />,
}))

const mockUseAppSelector = jest.fn((fn: (s: any) => any) =>
  fn({ mailLayout: { selectedMailIds: [] }, mailNavigation: { skipFolderFetch: false } })
)

describe('ListToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useAppSelector } = require('@/lib/redux/hooks')
    useAppSelector.mockImplementation(mockUseAppSelector)
  })

  describe('basic rendering', () => {
    it('renders folder title and message count when no selection', () => {
      render(<ListToolbar />)
      expect(screen.getByText('folders.inbox.string')).toBeInTheDocument()
      expect(screen.getByText('messages_number.string')).toBeInTheDocument()
    })

    it('renders ListFilter when not mobile', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-filter')).toBeInTheDocument()
    })

    it('renders ListSort when not mobile', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-sort')).toBeInTheDocument()
    })

    it('renders ListPagination', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('list-pagination')).toBeInTheDocument()
    })

    it('renders ListPagination when a client-side URL filter is active', () => {
      const { useSearchParams } = require('next/navigation')
      useSearchParams.mockReturnValue(new URLSearchParams('filter=unread'))
      render(<ListToolbar />)
      expect(screen.getByTestId('list-pagination')).toBeInTheDocument()
    })

    it('renders checkbox', () => {
      render(<ListToolbar />)
      expect(screen.getByTestId('checkbox')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows MailActionsBar when items selected', () => {
      const { useAppSelector } = require('@/lib/redux/hooks')
      useAppSelector.mockImplementation((fn: (s: any) => any) =>
        fn({ mailLayout: { selectedMailIds: ['1'] }, mailNavigation: { skipFolderFetch: false } })
      )
      render(<ListToolbar />)
      expect(screen.getByTestId('mail-actions-bar')).toBeInTheDocument()
    })

    it('handles array folder param', () => {
      const { useParams } = require('next/navigation')
      useParams.mockReturnValue({ folder: ['Archive', 'Old'] })
      render(<ListToolbar />)
      expect(screen.getByText('Archive/Old')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('has border-b and flex layout', () => {
      const { container } = render(<ListToolbar />)
      const root = container.firstChild as HTMLElement
      expect(root).toHaveClass('border-b', 'flex')
    })
  })
})
