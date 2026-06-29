import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

jest.mock('../../sidebar/actions/export-entry-dialog', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="export-entry-dialog" /> : null,
}))

import EntryActionsShell from '../entry-actions-shell'

const defaultProps = {
  writeMessageLabel: 'Write message',
  writeMessageDisabled: false,
  onWriteMessage: jest.fn(),
  writeMessageTestId: 'write-message-button',
  actionsMenuLabel: 'Actions menu',
  actionsMenuTestId: 'entry-actions-menu',
  exportLabel: 'Export',
  exportTestId: 'export-entry-button',
  onExportOpen: jest.fn(),
  writable: true,
  editLabel: 'Edit',
  editTestId: 'edit-entry-button',
  onEdit: jest.fn(),
  deleteLabel: 'Delete',
  deleteTestId: 'delete-entry-button',
  onDeleteOpen: jest.fn(),
  exportOpen: false,
  onExportOpenChange: jest.fn(),
  bookId: 'work',
  entryId: 'c1',
  entryLabel: 'John Doe',
  exportKind: 'individual' as const,
  deleteOpen: false,
  onDeleteOpenChange: jest.fn(),
  deleteDialogTitle: 'Delete entry',
  deleteDialogDescription: 'This cannot be undone.',
  cancelLabel: 'Cancel',
  deleteConfirmLabel: 'Confirm delete',
  onConfirmDelete: jest.fn(),
  isDeleting: false,
}

describe('EntryActionsShell', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('calls onWriteMessage when the write button is clicked', async () => {
    const user = userEvent.setup()
    const onWriteMessage = jest.fn()

    render(
      <EntryActionsShell {...defaultProps} onWriteMessage={onWriteMessage} />
    )

    await user.click(screen.getByTestId('write-message-button'))
    expect(onWriteMessage).toHaveBeenCalledTimes(1)
  })

  it('disables the write button when writeMessageDisabled is true', () => {
    render(
      <EntryActionsShell {...defaultProps} writeMessageDisabled />
    )

    expect(screen.getByTestId('write-message-button')).toBeDisabled()
  })

  it('hides edit and delete actions when the book is read-only', async () => {
    const user = userEvent.setup()

    render(<EntryActionsShell {...defaultProps} writable={false} />)

    await user.click(screen.getByTestId('entry-actions-menu'))

    expect(screen.getByTestId('export-entry-button')).toBeInTheDocument()
    expect(screen.queryByTestId('edit-entry-button')).not.toBeInTheDocument()
    expect(screen.queryByTestId('delete-entry-button')).not.toBeInTheDocument()
  })

  it('calls edit and delete handlers from the actions menu', async () => {
    const user = userEvent.setup()
    const onEdit = jest.fn()
    const onDeleteOpen = jest.fn()

    render(
      <EntryActionsShell
        {...defaultProps}
        onEdit={onEdit}
        onDeleteOpen={onDeleteOpen}
      />
    )

    await user.click(screen.getByTestId('entry-actions-menu'))
    await user.click(screen.getByTestId('edit-entry-button'))
    expect(onEdit).toHaveBeenCalledTimes(1)

    await user.click(screen.getByTestId('entry-actions-menu'))
    await user.click(screen.getByTestId('delete-entry-button'))
    expect(onDeleteOpen).toHaveBeenCalledTimes(1)
  })

  it('confirms deletion and disables actions while deleting', async () => {
    const user = userEvent.setup()
    const onConfirmDelete = jest.fn()

    const { rerender } = render(
      <EntryActionsShell
        {...defaultProps}
        deleteOpen
        onConfirmDelete={onConfirmDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: 'Confirm delete' }))
    expect(onConfirmDelete).toHaveBeenCalledTimes(1)

    rerender(
      <EntryActionsShell
        {...defaultProps}
        deleteOpen
        onConfirmDelete={onConfirmDelete}
        isDeleting
      />
    )

    expect(screen.getByRole('button', { name: 'Confirm delete' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled()
  })
})
