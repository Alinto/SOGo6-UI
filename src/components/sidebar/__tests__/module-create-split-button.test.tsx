import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseSidebar = jest.fn()
const mockUseCrossModuleCreateActions = jest.fn()

jest.mock('@/components/ui/sidebar', () => ({
  useSidebar: () => mockUseSidebar(),
  SidebarMenuButton: ({
    children,
    onClick,
    className,
    disabled,
  }: {
    children: React.ReactNode
    onClick?: () => void
    className?: string
    disabled?: boolean
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}))

jest.mock('@/hooks/use-cross-module-create-actions', () => ({
  useCrossModuleCreateActions: () => mockUseCrossModuleCreateActions(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import ModuleCreateSplitButton from '../module-create-split-button'

const primaryClick = jest.fn()
const eventClick = jest.fn()
const taskClick = jest.fn()

function renderButton() {
  mockUseCrossModuleCreateActions.mockReturnValue({
    primary: {
      id: 'mail',
      onClick: primaryClick,
      label: 'New message',
      icon: () => <span data-testid="mail-icon" />,
      disabled: false,
    },
    others: [
      {
        id: 'calendar',
        onClick: eventClick,
        label: 'Create Event',
        icon: () => null,
        disabled: false,
      },
      {
        id: 'task',
        onClick: taskClick,
        label: 'New task',
        icon: () => null,
        disabled: true,
      },
    ],
  })
  return render(<ModuleCreateSplitButton primary="mail" />)
}

describe('ModuleCreateSplitButton', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSidebar.mockReturnValue({ state: 'expanded' })
  })

  it('runs the current module action from the main button', async () => {
    const user = userEvent.setup()
    renderButton()

    await user.click(screen.getByRole('button', { name: /New message/ }))

    expect(primaryClick).toHaveBeenCalledTimes(1)
    expect(eventClick).not.toHaveBeenCalled()
  })

  it('opens the other modules from the chevron and keeps the current one out', async () => {
    const user = userEvent.setup()
    renderButton()

    const chevron = screen.getByRole('button', {
      name: 'create_menu.aria_label.string',
    })
    expect(chevron).toHaveAttribute('aria-haspopup', 'menu')
    expect(chevron).toHaveAttribute('aria-expanded', 'false')

    await user.click(chevron)

    expect(
      screen.getByRole('menuitem', { name: 'Create Event' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('menuitem', { name: 'New task' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('menuitem', { name: /New message/ })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('menuitem', { name: 'Create Event' }))
    expect(eventClick).toHaveBeenCalledTimes(1)
    expect(primaryClick).not.toHaveBeenCalled()
  })

  it('hides the chevron when the sidebar is collapsed', () => {
    mockUseSidebar.mockReturnValue({ state: 'collapsed' })
    renderButton()

    expect(
      screen.queryByRole('button', { name: 'create_menu.aria_label.string' })
    ).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /New message/ })
    ).toBeInTheDocument()
  })
})
