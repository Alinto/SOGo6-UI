import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import MessagesList from '../list'

// ── Mocks ──────────────────────────────────────────────────────────────────
jest.mock('@/hooks/use-mobile', () => ({ useIsMobile: jest.fn() }))
jest.mock('next/navigation', () => ({ useParams: jest.fn() }))
jest.mock('next-intl', () => ({ useTranslations: jest.fn() }))
jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(
    (fn: (s: { mailLayout: { selectedMailIds: string[] } }) => string[]) =>
      fn({ mailLayout: { selectedMailIds: [] } })
  ),
}))
jest.mock('@/lib/utils', () => ({
  cn: (...c: unknown[]) => c.filter(Boolean).join(' '),
}))
jest.mock('../utils', () => ({ nameSelector: jest.fn() }))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      data-testid="checkbox"
      checked={checked === true}
      ref={(el) => {
        if (el) el.indeterminate = checked === 'indeterminate'
      }}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: any) => <>{children}</>,
}))
jest.mock('@/components/dnd/draggable', () => ({
  __esModule: true,
  default: ({ children }: any) => <div data-testid="draggable">{children}</div>,
}))
jest.mock('../../hooks/use-mail-item-actions', () => ({
  useMailItemActions: jest.fn(() => ({
    deleteMail: jest.fn(),
    toggleRead: jest.fn(),
    archiveMail: jest.fn(),
    markSpam: jest.fn(),
    isJunk: false,
  })),
}))
jest.mock('../list-item', () => ({
  __esModule: true,
  default: ({ data }: any) => <div data-testid="list-item" data-id={data.id} />,
}))
jest.mock('../list-item-classic', () => ({
  __esModule: true,
  default: ({ data }: any) => (
    <div data-testid="list-item-classic" data-id={data.id} />
  ),
}))
jest.mock('../mail/mail-action-bar', () => ({
  __esModule: true,
  default: ({ actions, onAction }: any) => (
    <div data-testid="mail-actions-bar">
      {actions.map((a: any, i: number) => (
        <button
          key={a.id}
          data-testid={`action-${a.id}`}
          onClick={() => onAction?.(i, a)}
        >
          {a.title}
        </button>
      ))}
    </div>
  ),
}))
jest.mock('../list/list-filter', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter" />,
}))
jest.mock('../list/list-filter-dropdown', () => ({
  __esModule: true,
  default: () => <div data-testid="list-filter-dropdown" />,
}))
jest.mock('../list/list-pagination', () => ({
  __esModule: true,
  default: () => <div data-testid="list-pagination" />,
}))
jest.mock('../list/list-sort', () => ({
  __esModule: true,
  default: () => <div data-testid="list-sort" />,
}))
jest.mock('../skeletons/skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="skeleton" />,
}))
jest.mock('@/features/offline/hooks/use-open-mail-from-list', () => ({
  useOpenMailFromList: jest.fn(() => ({
    openMail: jest.fn(),
    unavailable: false,
    dismissUnavailable: jest.fn(),
  })),
}))
jest.mock('@/features/offline/components/offline-unavailable', () => ({
  __esModule: true,
  default: () => <div data-testid="offline-unavailable" />,
}))

// ── Setup ──────────────────────────────────────────────────────────────────
const mockUseIsMobile = require('@/hooks/use-mobile').useIsMobile
const mockUseParams = require('next/navigation').useParams
const mockUseTranslations = require('next-intl').useTranslations
const mockNameSelector = require('../utils').nameSelector
const mockUseOpenMailFromList =
  require('@/features/offline/hooks/use-open-mail-from-list').useOpenMailFromList

const items = [
  {
    id: '1',
    subject: 'Mail 1',
    from: { name: 'A', email: 'a@a.com' },
    to: [],
    date: '2024-01-01',
    seen: false,
    flagged: false,
    hasAttachment: false,
    snippet: '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  },
  {
    id: '2',
    subject: 'Mail 2',
    from: { name: 'B', email: 'b@b.com' },
    to: [],
    date: '2024-01-02',
    seen: true,
    flagged: true,
    hasAttachment: true,
    snippet: '',
    answered: false,
    forwarded: false,
    deleted: false,
    priority: 3,
    mailType: [],
  },
]

const defaultProps = {
  items,
  total: 2,
  page: 1,
  totalPages: 1,
  isLoading: false,
}

beforeEach(() => {
  jest.clearAllMocks()
  mockUseIsMobile.mockReturnValue(false)
  mockUseParams.mockReturnValue({ folder: 'INBOX' })
  mockUseTranslations.mockReturnValue((key: string) => key)
  mockNameSelector.mockReturnValue('INBOX')
  mockUseOpenMailFromList.mockReturnValue({
    openMail: jest.fn(),
    unavailable: false,
    dismissUnavailable: jest.fn(),
  })
})

// ── Tests ──────────────────────────────────────────────────────────────────
describe('MessagesList', () => {
  it('renders skeleton when loading', () => {
    render(<MessagesList {...defaultProps} isLoading />)
    expect(screen.getByTestId('skeleton')).toBeInTheDocument()
  })

  it('renders items when not loading', () => {
    render(<MessagesList {...defaultProps} />)
    expect(screen.getAllByTestId('list-item')).toHaveLength(2)
  })

  it('renders empty state when no items', () => {
    render(<MessagesList {...defaultProps} items={[]} />)
    expect(screen.getByText('no_items.string')).toBeInTheDocument()
  })

  it('wraps items in Draggable on desktop', () => {
    render(<MessagesList {...defaultProps} />)
    expect(screen.getAllByTestId('draggable')).toHaveLength(2)
  })

  it('does not wrap in Draggable on mobile', () => {
    mockUseIsMobile.mockReturnValue(true)
    render(<MessagesList {...defaultProps} />)
    expect(screen.queryByTestId('draggable')).not.toBeInTheDocument()
  })

  it('renders classic items when type is classic', () => {
    render(<MessagesList {...defaultProps} type="classic" />)
    expect(screen.getAllByTestId('list-item-classic')).toHaveLength(2)
  })

  it('does not render the offline banner — the folder layout owns it', () => {
    mockUseOpenMailFromList.mockReturnValue({
      openMail: jest.fn(),
      unavailable: true,
      dismissUnavailable: jest.fn(),
    })
    render(<MessagesList {...defaultProps} />)
    expect(screen.queryByTestId('offline-unavailable')).not.toBeInTheDocument()
  })
})
