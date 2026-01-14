import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useParams } from 'next/navigation'
import { ImapMessagesList } from '../../mails-types'
import ListItemClassic from '../list-item-classic'

// Mock next/navigation hooks
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>
const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseParams = useParams as jest.MockedFunction<typeof useParams>

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
  }

  const mockOnHandleCheckboxClick = jest.fn()

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
    render(
      <ListItemClassic
        data={mockData}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Test Subject')).toBeInTheDocument()
    expect(screen.getByText('J')).toBeInTheDocument() // Avatar fallback
  })


  it('should format date correctly', () => {
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 10) // 10 days ago, not in current week
    const mockDataWithPastDate = { ...mockData, date: pastDate.toISOString() }

    render(
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

    render(
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

    render(
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

    render(
      <ListItemClassic
        data={mockDataNoName}
        isSelected={false}
        onHandleCheckboxClick={mockOnHandleCheckboxClick}
      />
    )

    expect(screen.getByText('J')).toBeInTheDocument()
  })

})
