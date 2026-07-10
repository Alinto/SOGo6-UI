import { fireEvent, render, screen } from '@testing-library/react'
import {
  MAIL_PRIORITY_HIGH,
  MAIL_PRIORITY_NORMAL,
  toggleReadReceipt,
  updatePriority,
} from '../../../store/mail-compose-slice'
import { ComposeToolbar } from '../compose-toolbar'

const mockDispatch = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, title, ...props }: any) => (
    <button onClick={onClick} disabled={disabled} title={title} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: any) => <div>{children}</div>,
  DropdownMenuTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuGroup: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSeparator: () => <hr />,
  DropdownMenuItem: ({ children, onClick }: any) => (
    <button onClick={onClick}>{children}</button>
  ),
  DropdownMenuCheckboxItem: ({ children, checked, onCheckedChange }: any) => (
    <button
      aria-pressed={checked}
      onClick={() => onCheckedChange(!checked)}
    >
      {children}
    </button>
  ),
  DropdownMenuSub: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubTrigger: ({ children }: any) => <div>{children}</div>,
  DropdownMenuSubContent: ({ children }: any) => <div>{children}</div>,
  DropdownMenuRadioGroup: ({ children, onValueChange }: any) => (
    <div
      onClick={(e: React.MouseEvent) => {
        const value = (e.target as HTMLElement).getAttribute('data-value')
        if (value) onValueChange(value)
      }}
    >
      {children}
    </div>
  ),
  DropdownMenuRadioItem: ({ children, value }: any) => (
    <button data-value={value}>{children}</button>
  ),
}))

const baseProps = {
  draftId: 'draft-1',
  fileInputRef: { current: null },
  isUploading: false,
  onAttachmentClick: jest.fn(),
  onFileChange: jest.fn(),
  jitsiEnabled: false,
  onInsertJitsi: jest.fn(),
  requestReadReceipt: false,
  selectedPriority: MAIL_PRIORITY_NORMAL as 0 | 1 | 2 | 3 | 4,
  isSending: false,
  onSend: jest.fn(),
}

describe('ComposeToolbar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('clicking the attachment button calls onAttachmentClick', () => {
    render(<ComposeToolbar {...baseProps} />)
    fireEvent.click(screen.getByTitle('attachment.string'))
    expect(baseProps.onAttachmentClick).toHaveBeenCalledTimes(1)
  })

  it('forwards file input changes to onFileChange', () => {
    const { container } = render(<ComposeToolbar {...baseProps} />)
    const input = container.querySelector('input[type="file"]')!
    fireEvent.change(input)
    expect(baseProps.onFileChange).toHaveBeenCalledTimes(1)
  })

  it('hides the Jitsi button when jitsiEnabled is false', () => {
    render(<ComposeToolbar {...baseProps} jitsiEnabled={false} />)
    expect(screen.queryByTitle('jitsi.string')).not.toBeInTheDocument()
  })

  it('shows the Jitsi button and calls onInsertJitsi when enabled', () => {
    render(<ComposeToolbar {...baseProps} jitsiEnabled />)
    fireEvent.click(screen.getByTitle('jitsi.string'))
    expect(baseProps.onInsertJitsi).toHaveBeenCalledTimes(1)
  })

  it('toggles the read receipt checkbox by dispatching toggleReadReceipt', () => {
    render(<ComposeToolbar {...baseProps} requestReadReceipt={false} />)
    fireEvent.click(screen.getByText('return_receipt.string'))
    expect(mockDispatch).toHaveBeenCalledWith(
      toggleReadReceipt({ draftId: 'draft-1' })
    )
  })

  it('reflects the requestReadReceipt checked state', () => {
    render(<ComposeToolbar {...baseProps} requestReadReceipt />)
    expect(screen.getByText('return_receipt.string').closest('button')).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  it('dispatches updatePriority with the numeric value when changing priority', () => {
    render(<ComposeToolbar {...baseProps} />)
    fireEvent.click(screen.getByText('high.string'))
    expect(mockDispatch).toHaveBeenCalledWith(
      updatePriority({ draftId: 'draft-1', priority: MAIL_PRIORITY_HIGH })
    )
  })

  it('calls onSend when clicking the send button', () => {
    render(<ComposeToolbar {...baseProps} />)
    fireEvent.click(screen.getByText('send.string'))
    expect(baseProps.onSend).toHaveBeenCalledTimes(1)
  })

  it('shows the sending label while isSending is true', () => {
    render(<ComposeToolbar {...baseProps} isSending />)
    expect(screen.getByText('sending.string')).toBeInTheDocument()
    expect(screen.queryByText('send.string')).not.toBeInTheDocument()
  })

  it('disables the send button while sending or uploading', () => {
    const { rerender } = render(<ComposeToolbar {...baseProps} isSending />)
    expect(screen.getByText('sending.string').closest('button')).toBeDisabled()

    rerender(<ComposeToolbar {...baseProps} isUploading />)
    expect(screen.getByText('send.string').closest('button')).toBeDisabled()
  })

  it('renders the schedule sending menu item', () => {
    render(<ComposeToolbar {...baseProps} />)
    expect(screen.getByText('schedule_sending.string')).toBeInTheDocument()
  })
})
