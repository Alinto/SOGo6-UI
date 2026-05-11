import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FolderMessagesErrorFallback } from '@/features/mails/components/folder-messages-error-fallback'
import { logout } from '@/features/auth/components/store/auth.slice'
import React from 'react'

const mockPush = jest.fn()
const mockDispatch = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({ push: mockPush })),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => mockDispatch),
}))

jest.mock('@/lib/redux/api/error-handlers', () => ({
  getErrorStatus: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const { getErrorStatus } = jest.requireMock('@/lib/redux/api/error-handlers') as {
  getErrorStatus: jest.Mock
}

describe('FolderMessagesErrorFallback', () => {
  const refetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders nothing for 401 while triggering logout redirect', async () => {
      getErrorStatus.mockReturnValue(401)
      const { container } = render(
        <FolderMessagesErrorFallback
          error={{ status: 401 }}
          refetch={refetch}
          accountId="0"
        />
      )
      expect(container.firstChild).toBeNull()
      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
        expect(mockDispatch.mock.calls[0][0]).toEqual(logout())
        expect(mockPush).toHaveBeenCalledWith('/auth/login')
      })
    })

    it('renders folder not found and inbox button for 404', () => {
      getErrorStatus.mockReturnValue(404)
      render(
        <FolderMessagesErrorFallback
          error={{ status: 404 }}
          refetch={refetch}
          accountId="7"
        />
      )
      expect(
        screen.getByText('list_load_error.folder_not_found.string')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'list_load_error.open_inbox.string' })
      ).toBeInTheDocument()
    })

    it('renders mail unavailable and retry for 503', () => {
      getErrorStatus.mockReturnValue(503)
      render(
        <FolderMessagesErrorFallback
          error={{ status: 503 }}
          refetch={refetch}
          accountId="0"
        />
      )
      expect(
        screen.getByText('list_load_error.mail_unavailable.string')
      ).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'list_load_error.retry.string' })
      ).toBeInTheDocument()
    })

    it('renders generic message for other errors', () => {
      getErrorStatus.mockReturnValue(500)
      render(
        <FolderMessagesErrorFallback
          error={{ status: 500 }}
          refetch={refetch}
          accountId="0"
        />
      )
      expect(
        screen.getByText('list_load_error.generic.string')
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('navigates to INBOX when open inbox is clicked', async () => {
      const user = userEvent.setup()
      getErrorStatus.mockReturnValue(404)
      render(
        <FolderMessagesErrorFallback
          error={{ status: 404 }}
          refetch={refetch}
          accountId="3"
        />
      )
      await user.click(
        screen.getByRole('button', { name: 'list_load_error.open_inbox.string' })
      )
      expect(mockPush).toHaveBeenCalledWith('/u/3/INBOX')
    })

    it('calls refetch when retry is clicked', async () => {
      const user = userEvent.setup()
      getErrorStatus.mockReturnValue(503)
      render(
        <FolderMessagesErrorFallback
          error={{ status: 503 }}
          refetch={refetch}
          accountId="0"
        />
      )
      await user.click(
        screen.getByRole('button', { name: 'list_load_error.retry.string' })
      )
      expect(refetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom styling', () => {
    it('applies optional className', () => {
      getErrorStatus.mockReturnValue(500)
      const { container } = render(
        <FolderMessagesErrorFallback
          error={{ status: 500 }}
          refetch={refetch}
          accountId="0"
          className="custom-root"
        />
      )
      expect(container.querySelector('.custom-root')).toBeInTheDocument()
    })
  })
})
