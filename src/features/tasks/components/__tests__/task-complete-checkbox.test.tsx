import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TaskCompleteCheckbox from '../task-complete-checkbox'

describe('TaskCompleteCheckbox', () => {
  it('toggles optimistically and calls onToggle', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn().mockResolvedValue(undefined)

    render(
      <TaskCompleteCheckbox
        completed={false}
        label="My task"
        onToggle={onToggle}
      />
    )

    const button = screen.getByRole('checkbox', { name: 'My task' })
    expect(button).toHaveAttribute('aria-checked', 'false')

    await user.click(button)

    expect(button).toHaveAttribute('aria-checked', 'true')
    expect(onToggle).toHaveBeenCalledTimes(1)
  })

  it('reverts on error', async () => {
    const user = userEvent.setup()
    const onToggle = jest.fn().mockRejectedValue(new Error('fail'))

    render(
      <TaskCompleteCheckbox
        completed={false}
        label="My task"
        onToggle={onToggle}
      />
    )

    const button = screen.getByRole('checkbox', { name: 'My task' })
    await user.click(button)

    expect(button).toHaveAttribute('aria-checked', 'false')
  })
})
