import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import MailActionsBar from '../mail-action-bar'
import type { Action } from '../types'

jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: jest.fn(
    ({ children, onClick, disabled, 'data-testid': testId, ...props }: any) => (
      <button
        onClick={onClick}
        disabled={disabled}
        data-testid={testId}
        {...props}
      >
        {children}
      </button>
    )
  ),
}))

describe('MailActionsBar', () => {
  const defaultActions: Action[] = [
    {
      id: 'action-1',
      icon: <span data-testid="icon-1">Icon1</span>,
      title: 'Previous mail',
    },
    {
      id: 'action-2',
      icon: <span data-testid="icon-2">Icon2</span>,
      title: 'Next mail',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders the container div', () => {
      render(<MailActionsBar actions={defaultActions} />)

      const container = document.querySelector(
        'div.inline-flex.items-center.rounded-md.border'
      )
      expect(container).toBeInTheDocument()
    })

    it('renders each action icon', () => {
      render(<MailActionsBar actions={defaultActions} />)

      expect(screen.getByTestId('icon-1')).toBeInTheDocument()
      expect(screen.getByTestId('icon-2')).toBeInTheDocument()
    })

    it('renders without actions', () => {
      render(<MailActionsBar actions={[]} />)

      expect(screen.queryByTestId('icon-1')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('merges custom className', () => {
      render(
        <MailActionsBar actions={defaultActions} className="custom-class" />
      )

      const container = document.querySelector('div.custom-class')
      expect(container).toBeInTheDocument()
    })

    it('uses default empty string when className is omitted', () => {
      const { container } = render(<MailActionsBar actions={defaultActions} />)

      expect(container.firstChild).toHaveClass(
        'inline-flex',
        'items-center',
        'rounded-md'
      )
    })
  })

  describe('onAction callback', () => {
    it('calls onAction with index and action when non-disabled button is clicked', () => {
      const onAction = jest.fn()
      render(<MailActionsBar actions={defaultActions} onAction={onAction} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onAction).toHaveBeenCalledTimes(1)
      expect(onAction).toHaveBeenCalledWith(0, defaultActions[0])
    })

    it('calls onAction for second action', () => {
      const onAction = jest.fn()
      render(<MailActionsBar actions={defaultActions} onAction={onAction} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])

      expect(onAction).toHaveBeenCalledWith(1, defaultActions[1])
    })

    it('does not call onAction when onAction prop is undefined', () => {
      const onAction = jest.fn()
      render(<MailActionsBar actions={defaultActions} />)

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onAction).not.toHaveBeenCalled()
    })
  })

  describe('disabled actions', () => {
    it('passes disabled to TooltipButton when action.disabled is true', () => {
      const actionsWithDisabled: Action[] = [
        { ...defaultActions[0], disabled: true },
        defaultActions[1],
      ]
      render(<MailActionsBar actions={actionsWithDisabled} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons[0]).toBeDisabled()
      expect(buttons[1]).not.toBeDisabled()
    })

    it('does not call onAction when disabled action is clicked', () => {
      const onAction = jest.fn()
      const actionsWithDisabled: Action[] = [
        { ...defaultActions[0], disabled: true },
        defaultActions[1],
      ]
      render(
        <MailActionsBar actions={actionsWithDisabled} onAction={onAction} />
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[0])

      expect(onAction).not.toHaveBeenCalled()
    })

    it('calls onAction for non-disabled action when some actions are disabled', () => {
      const onAction = jest.fn()
      const actionsWithDisabled: Action[] = [
        { ...defaultActions[0], disabled: true },
        defaultActions[1],
      ]
      render(
        <MailActionsBar actions={actionsWithDisabled} onAction={onAction} />
      )

      const buttons = screen.getAllByRole('button')
      fireEvent.click(buttons[1])

      expect(onAction).toHaveBeenCalledWith(1, defaultActions[1])
    })
  })

  describe('data-testid', () => {
    it('sets data-testid from action title (lowercase, spaces to hyphens)', () => {
      render(<MailActionsBar actions={defaultActions} />)

      expect(
        screen.getByTestId('mail-action-btn-previous-mail')
      ).toBeInTheDocument()
      expect(
        screen.getByTestId('mail-action-btn-next-mail')
      ).toBeInTheDocument()
    })

    it('omits data-testid when action has no title', () => {
      const actionsNoTitle: Action[] = [{ id: 'a1', icon: <span>Icon</span> }]
      render(<MailActionsBar actions={actionsNoTitle} />)

      const button = screen.getByRole('button')
      expect(button).not.toHaveAttribute('data-testid')
    })
  })

  describe('separators', () => {
    it('renders separator between actions (not before first)', () => {
      render(<MailActionsBar actions={defaultActions} />)

      const separators = document.querySelectorAll(
        'div.bg-muted.mx-1.h-6.w-px[aria-hidden="true"]'
      )
      expect(separators).toHaveLength(1)
    })

    it('renders n-1 separators for n actions', () => {
      const threeActions: Action[] = [
        defaultActions[0],
        defaultActions[1],
        { ...defaultActions[0], id: 'a3', title: 'Third' },
      ]
      render(<MailActionsBar actions={threeActions} />)

      const separators = document.querySelectorAll('div[aria-hidden="true"]')
      expect(separators).toHaveLength(2)
    })

    it('renders no separator when only one action', () => {
      render(<MailActionsBar actions={[defaultActions[0]]} />)

      const separators = document.querySelectorAll('div.bg-muted.mx-1.h-6.w-px')
      expect(separators).toHaveLength(0)
    })
  })

  describe('children', () => {
    it('renders children inside the same bordered container as the actions', () => {
      render(
        <MailActionsBar actions={defaultActions}>
          <span data-testid="extra-child">Extra</span>
        </MailActionsBar>
      )

      const container = document.querySelector(
        'div.inline-flex.items-center.rounded-md.border'
      )
      const child = screen.getByTestId('extra-child')
      expect(container).toContainElement(child)
    })

    it('does not add a separator between the last action and children', () => {
      render(
        <MailActionsBar actions={defaultActions}>
          <span data-testid="extra-child">Extra</span>
        </MailActionsBar>
      )

      const separators = document.querySelectorAll(
        'div.bg-muted.mx-1.h-6.w-px[aria-hidden="true"]'
      )
      expect(separators).toHaveLength(1)
    })
  })

  describe('component stability', () => {
    it('renders consistently across re-renders', () => {
      const { rerender } = render(<MailActionsBar actions={defaultActions} />)

      expect(screen.getByTestId('icon-1')).toBeInTheDocument()

      rerender(<MailActionsBar actions={defaultActions} />)

      expect(screen.getByTestId('icon-1')).toBeInTheDocument()
      expect(screen.getByTestId('icon-2')).toBeInTheDocument()
    })
  })
})
