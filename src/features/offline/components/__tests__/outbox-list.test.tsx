/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import type { ReactNode } from 'react'
import type { OutboxRecord } from '../../types'
import OutboxList from '../outbox-list'

const mockDispatch = jest.fn()
let mockItems: OutboxRecord[] = []
let mockLoading = false

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: () => false,
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (fn: (s: unknown) => unknown) =>
    fn({ mailLayout: { selectedMailIds: [] } }),
}))

jest.mock('../../hooks/use-outbox', () => ({
  useOutboxList: () => ({
    items: mockItems,
    loading: mockLoading,
    remove: jest.fn(),
  }),
}))

jest.mock('../outbox-toolbar', () => ({
  __esModule: true,
  default: ({ itemIds }: { itemIds: string[] }) => (
    <div data-testid="outbox-toolbar">{itemIds.length}</div>
  ),
}))

jest.mock('../cached-data-indicator', () => ({
  __esModule: true,
  default: () => <div data-testid="cached-data-indicator" />,
}))

jest.mock('@/features/mails/components/list-item', () => ({
  __esModule: true,
  default: ({ data }: { data: { id: string; subject: string } }) => (
    <div data-testid={`list-item-${data.id}`}>{data.subject}</div>
  ),
}))

jest.mock('@/features/mails/components/skeletons/skeleton', () => ({
  __esModule: true,
  default: () => <div data-testid="list-skeleton" />,
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: () => null,
  AlertDialogAction: () => null,
  AlertDialogCancel: () => null,
  AlertDialogContent: () => null,
  AlertDialogDescription: () => null,
  AlertDialogFooter: () => null,
  AlertDialogHeader: () => null,
  AlertDialogTitle: () => null,
}))

jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}))

const item: OutboxRecord = {
  id: 'ob-1',
  userId: 'user@example.org',
  accountId: '0',
  mailKey: null,
  identityMail: 'me@example.org',
  signatureKey: null,
  to: [{ name: 'Alice', email: 'alice@example.org' }],
  cc: [],
  bcc: [],
  subject: 'Queued mail',
  body: 'Hi',
  isPlainText: true,
  priority: 3,
  requestReadReceipt: false,
  attachmentIds: [],
  status: 'pending',
  retryCount: 0,
  lastError: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

describe('OutboxList', () => {
  beforeEach(() => {
    mockDispatch.mockReset()
    mockItems = []
    mockLoading = false
  })

  it('renders mail list rows for queued messages', () => {
    mockItems = [item]
    render(<OutboxList onOpen={jest.fn()} onRequestDelete={jest.fn()} />)

    expect(screen.getByTestId('outbox-toolbar')).toHaveTextContent('1')
    expect(screen.getByTestId('list-item-ob-1')).toHaveTextContent(
      'Queued mail'
    )
  })

  it('renders the empty folder state', () => {
    render(<OutboxList onOpen={jest.fn()} onRequestDelete={jest.fn()} />)
    expect(screen.getByText('outbox_empty.string')).toBeInTheDocument()
  })
})
