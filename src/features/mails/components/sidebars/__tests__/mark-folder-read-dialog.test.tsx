import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MarkFolderReadDialog } from '../mark-folder-read-dialog'

const mockMarkFolderAsRead = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useMarkFolderAsReadMutation: jest.fn(() => [
    mockMarkFolderAsRead,
    { isLoading: false },
  ]),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: (children: React.ReactNode) => children,
}))

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  accountId: '0',
  folderPath: 'INBOX/Work',
  folderName: 'Work',
}

const confirmButton = () =>
  screen.getByRole('button', {
    name: 'folders.actions.mark_as_read_dialog.confirm.string',
  })

describe('MarkFolderReadDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockMarkFolderAsRead.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('renders the confirmation dialog', () => {
    render(<MarkFolderReadDialog {...defaultProps} />)
    expect(
      screen.getByText('folders.actions.mark_as_read_dialog.title.string')
    ).toBeInTheDocument()
  })

  it('marks the folder as read and closes on confirm', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(
      <MarkFolderReadDialog {...defaultProps} onOpenChange={onOpenChange} />
    )

    await user.click(confirmButton())

    await waitFor(() => {
      expect(mockMarkFolderAsRead).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'INBOX/Work',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('stays open when the request fails', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    mockMarkFolderAsRead.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('boom')),
    }))
    render(
      <MarkFolderReadDialog {...defaultProps} onOpenChange={onOpenChange} />
    )

    await user.click(confirmButton())

    await waitFor(() => expect(mockMarkFolderAsRead).toHaveBeenCalled())
    expect(onOpenChange).not.toHaveBeenCalledWith(false)
  })
})
