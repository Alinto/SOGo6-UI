import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'
import VisualizationPage from '../page'

jest.mock('@/features/mails/store/mails-api', () => ({
  useGetMailQuery: jest.fn(() => ({
    data: undefined,
    isLoading: false,
    isError: false,
  })),
}))

jest.mock('@/features/mails/components/mail/mail-return-button', () => ({
  MailReturnButton: ({ folderPath }: { folderPath: string }) => (
    <button data-testid="mail-return-button">{folderPath}</button>
  ),
}))

jest.mock('@/features/mails/components/mail/mail-action-bar', () => ({
  __esModule: true,
  default: ({ actions }: any) => (
    <div data-testid="mail-actions-bar">
      {actions?.length ?? 0} actions
    </div>
  ),
}))

jest.mock('@/features/mails/components/mail/mail-subject', () => ({
  __esModule: true,
  default: ({ subject }: any) => <h1 data-testid="mail-subject">{subject}</h1>,
}))

jest.mock('@/features/mails/components/mail/mail-header', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-header" />,
}))

jest.mock('@/features/mails/components/mail/mail-header-mobile', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-header-mobile" />,
}))

jest.mock('@/features/mails/components/mail/mail-content', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-content" />,
}))

jest.mock('@/features/mails/components/skeletons/skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="mail-detail-skeleton">Loading...</div>,
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    account: '0',
    folder: 'INBOX',
    mail_id: '34',
  })),
}))

describe('VisualizationPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    const { useParams } = require('next/navigation')
    useParams.mockReturnValue({ account: '0', folder: 'INBOX', mail_id: '34' })
    useGetMailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
    })
  })

  describe('basic rendering', () => {
    it('returns null when mail_id is missing', () => {
      const { useParams } = require('next/navigation')
      useParams.mockReturnValue({ account: '0', folder: 'INBOX', mail_id: undefined })
      const { container } = render(<VisualizationPage />)
      expect(container.firstChild).toBeNull()
    })

    it('renders skeleton when loading', () => {
      const { useGetMailQuery } = require('@/features/mails/store/mails-api')
      useGetMailQuery.mockReturnValue({ data: undefined, isLoading: true, isError: false })
      render(<VisualizationPage />)
      expect(screen.getByTestId('mail-detail-skeleton')).toBeInTheDocument()
    })

    it('returns null when error or no data', () => {
      const { useGetMailQuery } = require('@/features/mails/store/mails-api')
      useGetMailQuery.mockReturnValue({ data: undefined, isLoading: false, isError: true })
      const { container } = render(<VisualizationPage />)
      expect(container.firstChild).toBeNull()
    })

    it('renders mail content when data is available', () => {
      const { useGetMailQuery } = require('@/features/mails/store/mails-api')
      useGetMailQuery.mockReturnValue({
        data: {
          from: { name: 'Sender', email: 'sender@example.com' },
          to: [{ name: 'To', email: 'to@example.com' }],
          cc: [],
          date: '2024-01-01',
          subject: 'Test Subject',
          body: '',
          attachments: [],
          isMailingList: false,
        },
        isLoading: false,
        isError: false,
      })
      render(<VisualizationPage />)
      expect(screen.getByTestId('mail-return-button')).toBeInTheDocument()
      expect(screen.getByTestId('mail-subject')).toHaveTextContent('Test Subject')
      expect(screen.getByTestId('mail-header')).toBeInTheDocument()
      expect(screen.getByTestId('mail-content')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('renders desktop actions bar when not mobile', () => {
      const { useGetMailQuery } = require('@/features/mails/store/mails-api')
      useGetMailQuery.mockReturnValue({
        data: {
          from: { name: 'Sender', email: 'sender@example.com' },
          to: [{ name: 'To', email: 'to@example.com' }],
          cc: [],
          date: '2024-01-01',
          subject: 'Test',
          body: '',
          attachments: [],
          isMailingList: false,
        },
        isLoading: false,
        isError: false,
      })
      render(<VisualizationPage />)
      const actionsBars = screen.getAllByTestId('mail-actions-bar')
      expect(actionsBars.length).toBeGreaterThan(0)
    })
  })
})
