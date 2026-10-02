import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseModuleCreateAction = jest.fn()
const mockUseCrossModuleCreateActions = jest.fn()

jest.mock('@/hooks/use-module-create-action', () => ({
  useModuleCreateAction: () => mockUseModuleCreateAction(),
}))

jest.mock('@/hooks/use-cross-module-create-actions', () => ({
  useCrossModuleCreateActions: () => mockUseCrossModuleCreateActions(),
}))

jest.mock('@/hooks/create-module-from-pathname', () => ({
  createModuleFromPathname: () => 'mail',
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: () => '/u/0/INBOX',
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: () => ({ moduleAccess: [], isLoading: false }),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

import MobileCreateFab from '../mobile-create-fab'

describe('MobileCreateFab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseCrossModuleCreateActions.mockReturnValue({
      primary: null,
      others: [],
    })
  })

  it('renders nothing when no action is available', () => {
    mockUseModuleCreateAction.mockReturnValue(null)
    const { container } = render(<MobileCreateFab />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders FAB with aria-label and triggers onClick', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const MockIcon = () => <span data-testid="fab-icon" />

    mockUseModuleCreateAction.mockReturnValue({
      onClick,
      label: 'New message',
      icon: MockIcon,
    })

    render(<MobileCreateFab />)

    const button = screen.getByTestId('mobile-create-fab')
    expect(button).toHaveAttribute('aria-label', 'New message')
    expect(screen.getByTestId('fab-icon')).toBeInTheDocument()

    await user.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('opens other create actions from the chevron without using the primary click', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    const onTask = jest.fn()
    const MockIcon = () => <span data-testid="fab-icon" />

    mockUseModuleCreateAction.mockReturnValue({
      onClick,
      label: 'New message',
      icon: MockIcon,
    })
    mockUseCrossModuleCreateActions.mockReturnValue({
      primary: null,
      others: [
        {
          id: 'task',
          onClick: onTask,
          label: 'New task',
          icon: () => null,
        },
      ],
    })

    render(<MobileCreateFab />)

    await user.click(
      screen.getByRole('button', { name: 'create_menu.aria_label.string' })
    )
    await user.click(screen.getByRole('menuitem', { name: 'New task' }))

    expect(onTask).toHaveBeenCalledTimes(1)
    expect(onClick).not.toHaveBeenCalled()
  })
})
