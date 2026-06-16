import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseModuleCreateAction = jest.fn()

jest.mock('@/hooks/use-module-create-action', () => ({
  useModuleCreateAction: () => mockUseModuleCreateAction(),
}))

import MobileCreateFab from '../mobile-create-fab'

describe('MobileCreateFab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
})
