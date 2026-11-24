import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RailMoreButton from '../rail-more-button'

const mockSetOpen = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { count?: number }) =>
    `${key}:${values?.count}`,
}))

jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => (
    <li>{children}</li>
  ),
  SidebarMenuButton: ({
    children,
    onClick,
    'aria-label': ariaLabel,
  }: {
    children: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    'aria-label'?: string
  }) => (
    <button type="button" aria-label={ariaLabel} onClick={onClick}>
      {children}
    </button>
  ),
  useSidebar: () => ({ setOpen: mockSetOpen }),
}))

describe('RailMoreButton', () => {
  beforeEach(() => {
    mockSetOpen.mockClear()
  })

  it('shows the shared "+N" badge, named by the full label', () => {
    render(<RailMoreButton label="3 more calendars" count={3} />)

    expect(
      screen.getByRole('button', { name: '3 more calendars' })
    ).toHaveTextContent('sidebar.rail_more_badge.string:3')
  })

  it('expands the sidebar on click', async () => {
    render(<RailMoreButton label="3 more calendars" count={3} />)

    await userEvent.click(screen.getByRole('button'))

    expect(mockSetOpen).toHaveBeenCalledWith(true)
  })

  it('moves the focus to the enclosing navigation before expanding', async () => {
    render(
      <nav aria-label="Calendars" tabIndex={-1}>
        <ul>
          <RailMoreButton label="3 more calendars" count={3} />
        </ul>
      </nav>
    )

    await userEvent.click(screen.getByRole('button'))

    expect(screen.getByRole('navigation', { name: 'Calendars' })).toHaveFocus()
  })
})
