import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import ClassicMailFolderDefault from '../default'

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    folder: 'INBOX',
    account: '0',
    mail_id: undefined,
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

const mockUseFolderMessages = jest.fn()

jest.mock('@/features/mails/hooks/use-folder-messages', () => ({
  useFolderMessages: (...args: unknown[]) => mockUseFolderMessages(...args),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
}))

jest.mock('@/features/mails/components/skeletons/list-skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-list-skeleton" />,
}))

jest.mock('@/features/mails/components/folder-messages-error-fallback', () => ({
  FolderMessagesErrorFallback: () => (
    <div data-testid="folder-messages-error" />
  ),
}))

jest.mock('@/features/mails/components/list', () => ({
  __esModule: true,
  default: () => <div data-testid="messages-list" />,
}))

describe('@classic/default', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('shows skeleton while loading', () => {
      mockUseFolderMessages.mockReturnValue({
        data: undefined,
        isLoading: true,
        isFetching: false,
        error: undefined,
        refetch: jest.fn(),
      })
      render(<ClassicMailFolderDefault />)
      expect(screen.getByTestId('mail-list-skeleton')).toBeInTheDocument()
    })

    it('shows error fallback when query errors', () => {
      mockUseFolderMessages.mockReturnValue({
        data: undefined,
        isLoading: false,
        isFetching: false,
        error: { status: 500 },
        refetch: jest.fn(),
      })
      render(<ClassicMailFolderDefault />)
      expect(screen.getByTestId('folder-messages-error')).toBeInTheDocument()
    })

    it('shows messages list when loaded', () => {
      mockUseFolderMessages.mockReturnValue({
        data: {
          mails: [{ id: '1' }],
          page: 1,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: jest.fn(),
      })
      render(<ClassicMailFolderDefault />)
      expect(screen.getByTestId('messages-list')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('passes folder and account to useFolderMessages', () => {
      mockUseFolderMessages.mockReturnValue({
        data: { mails: [], page: 1, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
        isLoading: false,
        isFetching: false,
        error: undefined,
        refetch: jest.fn(),
      })
      render(<ClassicMailFolderDefault />)
      expect(mockUseFolderMessages).toHaveBeenCalledWith({
        folder: 'INBOX',
        accountId: '0',
      })
    })
  })
})
