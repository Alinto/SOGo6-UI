import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({
    checked,
    disabled,
    'aria-label': ariaLabel,
    'data-testid': dataTestId,
    onCheckedChange,
    onClick,
    className,
  }: {
    checked?: boolean | 'indeterminate'
    disabled?: boolean
    'aria-label'?: string
    'data-testid'?: string
    onCheckedChange?: (checked: boolean | 'indeterminate') => void
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
    className?: string
  }) => (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked === 'indeterminate' ? 'mixed' : checked}
      aria-label={ariaLabel}
      data-testid={dataTestId}
      disabled={disabled}
      className={className}
      onClick={(event) => {
        onClick?.(event)
        if (!disabled) {
          onCheckedChange?.(checked === true ? false : true)
        }
      }}
    />
  ),
}))

import TaskSelectCheckbox, {
  TaskSelectCheckboxIndicator,
} from '../task-select-checkbox'

describe('TaskSelectCheckbox', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with accessible label', () => {
    render(
      <TaskSelectCheckbox label="Select task Buy milk" data-testid="task-select" />
    )

    expect(
      screen.getByRole('checkbox', { name: 'Select task Buy milk' })
    ).toBeInTheDocument()
    expect(screen.getByTestId('task-select')).toBeInTheDocument()
  })

  it('calls onCheckedChange when toggled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()

    render(
      <TaskSelectCheckbox
        label="Select task"
        checked={false}
        onCheckedChange={onCheckedChange}
      />
    )

    await user.click(screen.getByRole('checkbox', { name: 'Select task' }))
    expect(onCheckedChange).toHaveBeenCalledWith(true)
  })

  it('does not toggle when disabled', async () => {
    const user = userEvent.setup()
    const onCheckedChange = jest.fn()

    render(
      <TaskSelectCheckbox
        label="Select task"
        disabled
        onCheckedChange={onCheckedChange}
      />
    )

    await user.click(screen.getByRole('checkbox', { name: 'Select task' }))
    expect(onCheckedChange).not.toHaveBeenCalled()
  })

  it('forwards onClick to the checkbox', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()

    render(
      <TaskSelectCheckbox label="Select task" onClick={onClick} />
    )

    await user.click(screen.getByRole('checkbox', { name: 'Select task' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('TaskSelectCheckboxIndicator', () => {
  it('renders a non-interactive placeholder', () => {
    const { container } = render(<TaskSelectCheckboxIndicator />)

    const indicator = container.querySelector('[aria-hidden="true"]')
    expect(indicator).toBeInTheDocument()
    expect(indicator).toHaveClass('rounded-sm')
  })
})
