/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ReactNode } from 'react'
import OutboxSidebarItem from '../outbox-sidebar-item'

const mockOpenOutbox = jest.fn()
let mockPendingCount = 0
let mockOutboxEnabled = true
let mockView: { kind: string } = { kind: 'route' }
let mockPathname = '/u/0/INBOX'

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('next/navigation', () => ({
  useParams: () => ({ account: '0' }),
  usePathname: () => mockPathname,
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name }: { name: string }) => (
    <span data-testid={`icon-${name}`} />
  ),
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuItem: ({
    children,
    ...props
  }: {
    children: ReactNode
  } & Record<string, unknown>) => <div {...props}>{children}</div>,
  SidebarMenuButton: ({
    children,
    isActive,
    onClick,
  }: {
    children: ReactNode
    isActive?: boolean
    onClick?: () => void
  }) => (
    <button type="button" data-active={String(!!isActive)} onClick={onClick}>
      {children}
    </button>
  ),
}))

jest.mock('../../flags', () => ({
  isPwaOutboxEnabled: () => mockOutboxEnabled,
}))

jest.mock('../../hooks/use-outbox', () => ({
  useOutboxList: () => ({ pendingCount: mockPendingCount }),
}))

jest.mock('../../offline-nav-context', () => ({
  useOfflineNav: () => ({
    openOutbox: mockOpenOutbox,
    view: mockView,
  }),
}))

describe('OutboxSidebarItem', () => {
  beforeEach(() => {
    mockOpenOutbox.mockReset()
    mockPendingCount = 0
    mockOutboxEnabled = true
    mockView = { kind: 'route' }
    mockPathname = '/u/0/INBOX'
  })

  it('hides when there is nothing waiting to send', () => {
    render(<OutboxSidebarItem />)
    expect(screen.queryByTestId('outbox-sidebar-item')).not.toBeInTheDocument()
  })

  it('shows with a pending badge in the folder list style', () => {
    mockPendingCount = 2
    render(<OutboxSidebarItem />)

    expect(screen.getByTestId('outbox-sidebar-item')).toBeInTheDocument()
    expect(screen.getByTestId('icon-clock')).toBeInTheDocument()
    expect(screen.getByText('outbox_folder.string')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('stays visible on the outbox view even when empty', () => {
    mockView = { kind: 'outbox' }
    render(<OutboxSidebarItem />)
    expect(screen.getByTestId('outbox-sidebar-item')).toBeInTheDocument()
  })

  it('opens the outbox on click', async () => {
    mockPendingCount = 1
    const user = userEvent.setup()
    render(<OutboxSidebarItem />)

    await user.click(screen.getByRole('button'))
    expect(mockOpenOutbox).toHaveBeenCalledWith('0')
  })

  it('hides when the outbox flag is off', () => {
    mockOutboxEnabled = false
    mockPendingCount = 3
    render(<OutboxSidebarItem />)
    expect(screen.queryByTestId('outbox-sidebar-item')).not.toBeInTheDocument()
  })
})
