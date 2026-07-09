import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetFolderTypeDialog } from '../set-folder-type-dialog'

const mockSetFolderType = jest.fn(() => ({
  unwrap: () => Promise.resolve(),
}))

jest.mock('@/features/mails/store/mails-api', () => ({
  useSetFolderTypeMutation: jest.fn(() => [mockSetFolderType, { isLoading: false }]),
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
  folderPath: 'Work',
  folderName: 'Work',
}

describe('SetFolderTypeDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockSetFolderType.mockImplementation(() => ({
      unwrap: () => Promise.resolve(),
    }))
  })

  it('renders set-as type options', () => {
    render(<SetFolderTypeDialog {...defaultProps} />)
    expect(
      screen.getByText('folders.actions.set_as_dialog.types.SENT.string')
    ).toBeInTheDocument()
    expect(
      screen.getByText('folders.actions.set_as_dialog.types.DRAFT.string')
    ).toBeInTheDocument()
  })

  it('calls setFolderType mutation when a type is selected', async () => {
    const user = userEvent.setup()
    const onOpenChange = jest.fn()
    render(<SetFolderTypeDialog {...defaultProps} onOpenChange={onOpenChange} />)

    await user.click(
      screen.getByRole('button', {
        name: 'folders.actions.set_as_dialog.types.SENT.string',
      })
    )

    await waitFor(() => {
      expect(mockSetFolderType).toHaveBeenCalledWith({
        accountId: '0',
        folderPath: 'Work',
        type: 'SENT',
      })
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })
})
