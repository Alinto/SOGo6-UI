import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AddUserDialog from '../add-user-dialog'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

describe('AddUserDialog', () => {
  it('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(
      <AddUserDialog open onOpenChange={jest.fn()} existingKeys={new Set()} onAdd={onAdd} />
    )

    await user.type(screen.getByPlaceholderText('addUser.dialog.placeholder.string'), 'not-an-email')
    await user.click(screen.getByText('addUser.dialog.confirm.string'))

    expect(screen.getByText('addUser.dialog.error.invalid.string')).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('rejects an email already in the list', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    render(
      <AddUserDialog
        open
        onOpenChange={jest.fn()}
        existingKeys={new Set(['bob@example.com'])}
        onAdd={onAdd}
      />
    )

    await user.type(screen.getByPlaceholderText('addUser.dialog.placeholder.string'), 'bob@example.com')
    await user.click(screen.getByText('addUser.dialog.confirm.string'))

    expect(screen.getByText('addUser.dialog.error.duplicate.string')).toBeInTheDocument()
    expect(onAdd).not.toHaveBeenCalled()
  })

  it('calls onAdd with the trimmed email and closes on success', async () => {
    const user = userEvent.setup()
    const onAdd = jest.fn()
    const onOpenChange = jest.fn()
    render(
      <AddUserDialog
        open
        onOpenChange={onOpenChange}
        existingKeys={new Set()}
        onAdd={onAdd}
      />
    )

    await user.type(
      screen.getByPlaceholderText('addUser.dialog.placeholder.string'),
      '  newuser@example.com  '
    )
    await user.click(screen.getByText('addUser.dialog.confirm.string'))

    expect(onAdd).toHaveBeenCalledWith('newuser@example.com')
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })
})
