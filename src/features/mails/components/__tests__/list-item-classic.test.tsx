import { mailComposeReducer } from '@/features/mails/store'
import { apiSlice } from '@/lib/redux/api/api-slice'
import { useRouter } from '@/lib/i18n/navigation'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams, usePathname } from 'next/navigation'
import { Provider } from 'react-redux'
import { ImapMessagesList } from '../../mails-types'
import ListItemClassic from '../list-item-classic'

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>

describe('ListItemClassic', () => {
  const mockData: ImapMessagesList = {
    id: '1',
    subject: 'Test Subject',
    from: { name: 'John Doe', email: 'john@example.com' },
    to: [{ name: 'Recipient', email: 'recipient@example.com' }],
    date: new Date().toISOString(),
    seen: false,
    flagged: true,
    hasAttachment: true,
    snippet: 'Test snippet',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  }

  const mockOnHandleCheckboxClick = jest.fn()

  const createTestStore = () =>
    configureStore({
      reducer: {
        mailCompose: mailComposeReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    })

  const renderWithRedux = (ui: React.ReactElement) =>
    render(<Provider store={createTestStore()}>{ui}</Provider>)

  beforeEach(() => {
    mockUseRouter.mockReturnValue({
      push: jest.fn(),
    } as any)
    mockUsePathname.mockReturnValue('/test-path')
    mockUseParams.mockReturnValue({})
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should render correctly', () => {
    renderWithRedux(
      <ListItemClassic
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    expect(screen.getByText('Test snippet')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument() // Avatar fallback
  })


  it('should format date correctly', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 10) // 10 days ago, not in current week
    const mockDataWithPastDate = { ...mockData, date: pastDate.toISOString() }

    renderWithRedux(
      <ListItemClassic
        data={mockDataWithPastDate}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(
      screen.getByText(
        pastDate.toLocaleDateString([], { month: 'short', day: 'numeric' })
      )
    ).toBeInTheDocument()
  })

  it('should not show attachment icon when hasAttachment is false', () => {
    const mockDataNoAttachment = { ...mockData, hasAttachment: false }

    renderWithRedux(
      <ListItemClassic
        data={mockDataNoAttachment}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(screen.queryByTestId('paperclip-icon')).not.toBeInTheDocument()
  })


  it('should not apply unread background when seen is true', () => {
    const mockDataSeen = { ...mockData, seen: true }

    renderWithRedux(
      <ListItemClassic
        data={mockDataSeen}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    const item = screen.getByText('John Doe').closest('div')
    expect(item).not.toHaveClass('bg-primary/15')
  })

  it('should use email initial when name is empty', () => {
    const mockDataNoName = { ...mockData, from: { name: '', email: 'john@example.com' } }

    renderWithRedux(
      <ListItemClassic
        data={mockDataNoName}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(screen.getByText('J')).toBeInTheDocument()
  })

})
