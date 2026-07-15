import authReducer from '@/features/auth/components/store/auth.slice'
import mailNavigationReducer from '@/features/mails/store/mail-navigation-slice'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { configureStore } from '@reduxjs/toolkit'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import MailPage from '../page'

const createTestStore = (preloadedState: Record<string, unknown> = {}) =>
  configureStore({
    reducer: {
      auth: authReducer,
      mailNavigation: mailNavigationReducer,
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
    preloadedState: {
      auth: {
        token: null,
        user: {
          uid: 'test',
          cn: 'Test User',
          email: 'test@example.com',
        },
        rememberMe: false,
      },
      ...preloadedState,
    },
  })

// Mock des hooks Next.js
jest.mock('next/navigation', () => ({
  useParams: jest.fn(() => ({
    account: 'test@example.com',
    folder: 'inbox',
    mail_id: '123',
  })),
}))

const mockPush = jest.fn()
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(),
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

// Mock du hook useIsMobile
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

// Mock de l'API mails
jest.mock('@/features/mails/store/mails-api', () => ({
  useGetMailQuery: jest.fn(),
}))

// Mock du hook des actions de réponse/transfert
jest.mock('@/features/mails/hooks/use-mail-reply-actions', () => ({
  useMailReplyActions: jest.fn(() => ({
    rightActions: [],
    handleMailAction: jest.fn(),
  })),
}))

jest.mock('@/features/mails/hooks/use-mail-invitation', () => ({
  useMailInvitation: jest.fn(() => ({ kind: 'none' })),
}))

jest.mock('@/features/mails/components/mail/mail-invitation-widget', () =>
  jest.fn(() => <div data-testid="mail-invitation-widget">Invitation</div>)
)

// Mock des composants
jest.mock('@/features/mails/components/mail/mail-action-bar', () =>
  jest.fn(() => <div data-testid="mail-actions-bar">Mail Actions Bar</div>)
)

jest.mock('@/features/mails/components/mail/mail-detail-action-bar', () =>
  jest.fn(() => (
    <div data-testid="mail-detail-action-bar">Mail Detail Actions</div>
  ))
)

jest.mock('@/features/mails/components/mail/mail-content', () =>
  jest.fn(() => <div data-testid="mail-content">Mail Content</div>)
)

jest.mock('@/features/mails/components/mail/mail-header', () =>
  jest.fn(() => <div data-testid="mail-header">Mail Header</div>)
)

jest.mock('@/features/mails/components/mail/mail-header-mobile', () =>
  jest.fn(() => <div data-testid="mail-header-mobile">Mail Header Mobile</div>)
)

jest.mock('@/features/mails/components/mail/mail-return-button', () => ({
  MailReturnButton: jest.fn(() => (
    <div data-testid="mail-return-button">Return Button</div>
  )),
}))

jest.mock('@/features/mails/components/mail/mail-subject', () =>
  jest.fn(() => <div data-testid="mail-subject">Mail Subject</div>)
)

jest.mock('@/features/mails/components/skeletons/skeleton', () =>
  jest.fn(() => <div data-testid="mail-skeleton">Loading...</div>)
)

describe('MailPage', () => {
  const mockMailData = {
    id: '123',
    from: 'sender@example.com',
    to: ['recipient@example.com'],
    cc: ['cc@example.com'],
    subject: 'Test Subject',
    body: '<p>Test Body</p>',
    date: new Date().toISOString(),
    isMailingList: false,
    attachments: [],
    seen: true,
    flags: [],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render skeleton when loading', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    useGetMailQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    })

    render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )
    expect(screen.getByTestId('mail-skeleton')).toBeInTheDocument()
  })

  it('should render null when error occurs', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    useGetMailQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    })

    const { container } = render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render mail content when data is loaded (desktop)', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    const { useIsMobile } = require('@/hooks/use-mobile')

    useGetMailQuery.mockReturnValue({
      data: mockMailData,
      isLoading: false,
      isError: false,
    })
    useIsMobile.mockReturnValue(false)

    render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )

    expect(screen.getByTestId('mail-return-button')).toBeInTheDocument()
    expect(screen.getByTestId('mail-subject')).toBeInTheDocument()
    expect(screen.getByTestId('mail-header')).toBeInTheDocument()
    expect(screen.getByTestId('mail-content')).toBeInTheDocument()
  })

  it('should render mobile header when on mobile', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    const { useIsMobile } = require('@/hooks/use-mobile')

    useGetMailQuery.mockReturnValue({
      data: mockMailData,
      isLoading: false,
      isError: false,
    })
    useIsMobile.mockReturnValue(true)

    render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )

    expect(screen.getByTestId('mail-header-mobile')).toBeInTheDocument()
    expect(screen.queryByTestId('mail-header')).not.toBeInTheDocument()
  })

  it('should render null when data is null', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    useGetMailQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
    })

    const { container } = render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )
    expect(container.firstChild).toBeNull()
  })

  it('should parse email contacts correctly', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    useGetMailQuery.mockReturnValue({
      data: mockMailData,
      isLoading: false,
      isError: false,
    })

    render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )
    expect(screen.getByTestId('mail-content')).toBeInTheDocument()
  })

  it('should render invitation widget when mail has calendar event', () => {
    const { useGetMailQuery } = require('@/features/mails/store/mails-api')
    const {
      useMailInvitation,
    } = require('@/features/mails/hooks/use-mail-invitation')

    useGetMailQuery.mockReturnValue({
      data: { ...mockMailData, mail_type: ['event'] },
      isLoading: false,
      isError: false,
    })
    useMailInvitation.mockReturnValue({
      kind: 'invitation',
      parsed: {
        method: 'REQUEST',
        uid: 'uid@test.org',
        summary: 'Demo',
        dtStart: '2026-07-15T10:00:00.000Z',
        allDay: false,
      },
      eventKey: 'evt-1',
      canRsvp: true,
      event: {
        id: 'evt-1',
        calendar_id: 'cal-1',
        title: 'Demo',
        all_day: false,
      },
    })

    render(
      <Provider store={createTestStore()}>
        <MailPage />
      </Provider>
    )
    expect(screen.getByTestId('mail-invitation-widget')).toBeInTheDocument()
  })
})
