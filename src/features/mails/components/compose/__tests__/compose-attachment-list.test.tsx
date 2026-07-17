import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { MailComposeAttachment } from '../../../store/mail-compose-slice'
import { removeAttachment } from '../../../store/mail-compose-slice'
import { ComposeAttachmentList } from '../compose-attachment-list'

const mockDispatch = jest.fn()
const mockDeleteAttachment = jest.fn()
const mockTriggerDownloadAttachment = jest.fn()

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

jest.mock('../../../store/mail-api', () => ({
  useDeleteAttachmentMutation: () => [mockDeleteAttachment],
  useLazyDownloadAttachmentQuery: () => [mockTriggerDownloadAttachment],
}))

const attachment = (
  overrides: Partial<MailComposeAttachment> = {}
): MailComposeAttachment => ({
  draftId: 'att-1',
  name: 'file.txt',
  size: 500,
  type: 'text/plain',
  uploadStatus: 'completed',
  uploadProgress: 100,
  ...overrides,
})

const baseProps = {
  draftId: 'draft-1',
  accountId: 'acc-1',
  mailKey: 'key-1' as string | null,
}

describe('ComposeAttachmentList', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockDeleteAttachment.mockResolvedValue({})
  })

  it('renders nothing when there are no attachments', () => {
    const { container } = render(
      <ComposeAttachmentList {...baseProps} attachments={[]} />
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders the attachment name and formatted size', () => {
    render(
      <ComposeAttachmentList {...baseProps} attachments={[attachment()]} />
    )
    expect(screen.getByText('file.txt')).toBeInTheDocument()
    expect(screen.getByText('500 B')).toBeInTheDocument()
  })

  it('shows an error label for an errored attachment', () => {
    render(
      <ComposeAttachmentList
        {...baseProps}
        attachments={[attachment({ uploadStatus: 'error' })]}
      />
    )
    expect(screen.getByText('attachment_error.string')).toBeInTheDocument()
  })

  it('shows a progress bar with percentage while uploading', () => {
    render(
      <ComposeAttachmentList
        {...baseProps}
        attachments={[
          attachment({ uploadStatus: 'uploading', uploadProgress: 42 }),
        ]}
      />
    )
    expect(screen.getByText('42%')).toBeInTheDocument()
  })

  it('only shows the download button for completed attachments', () => {
    const { rerender } = render(
      <ComposeAttachmentList
        {...baseProps}
        attachments={[attachment({ uploadStatus: 'completed' })]}
      />
    )
    expect(screen.getByTitle('attachment.download.string')).toBeInTheDocument()

    rerender(
      <ComposeAttachmentList
        {...baseProps}
        attachments={[attachment({ uploadStatus: 'uploading' })]}
      />
    )
    expect(
      screen.queryByTitle('attachment.download.string')
    ).not.toBeInTheDocument()
  })

  it('disables the delete button while an attachment is uploading', () => {
    render(
      <ComposeAttachmentList
        {...baseProps}
        attachments={[attachment({ uploadStatus: 'uploading' })]}
      />
    )
    const buttons = screen.getAllByRole('button')
    const deleteButton = buttons[buttons.length - 1]
    expect(deleteButton).toBeDisabled()
  })

  describe('deleting an attachment', () => {
    it('removes it from the store directly when it is not completed', async () => {
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          attachments={[attachment({ uploadStatus: 'error' })]}
        />
      )

      await user.click(screen.getAllByRole('button')[0])

      expect(mockDeleteAttachment).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        removeAttachment({ draftId: 'draft-1', attachmentId: 'att-1' })
      )
    })

    it('removes it from the store directly when there is no mailKey', async () => {
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          mailKey={null}
          attachments={[attachment({ uploadStatus: 'completed' })]}
        />
      )

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[buttons.length - 1])

      expect(mockDeleteAttachment).not.toHaveBeenCalled()
      expect(mockDispatch).toHaveBeenCalledWith(
        removeAttachment({ draftId: 'draft-1', attachmentId: 'att-1' })
      )
    })

    it('calls the delete mutation and removes it from the store on success', async () => {
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          attachments={[attachment({ uploadStatus: 'completed' })]}
        />
      )

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[buttons.length - 1])

      expect(mockDeleteAttachment).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: 'key-1',
        filename: 'file.txt',
      })
      expect(mockDispatch).toHaveBeenCalledWith(
        removeAttachment({ draftId: 'draft-1', attachmentId: 'att-1' })
      )
    })

    it('does not remove it from the store when the delete mutation errors', async () => {
      mockDeleteAttachment.mockResolvedValue({ error: { status: 500 } })
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          attachments={[attachment({ uploadStatus: 'completed' })]}
        />
      )

      const buttons = screen.getAllByRole('button')
      await user.click(buttons[buttons.length - 1])

      expect(mockDispatch).not.toHaveBeenCalled()
    })
  })

  describe('downloading an attachment', () => {
    beforeEach(() => {
      global.URL.createObjectURL = jest.fn(() => 'blob:mock-url')
      global.URL.revokeObjectURL = jest.fn()
      jest
        .spyOn(HTMLAnchorElement.prototype, 'click')
        .mockImplementation(() => {})
    })

    it('triggers the download query and clicks a generated link', async () => {
      const blob = new Blob(['content'])
      mockTriggerDownloadAttachment.mockReturnValue({
        unwrap: () => Promise.resolve(blob),
      })
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          attachments={[attachment({ uploadStatus: 'completed' })]}
        />
      )

      await user.click(screen.getByTitle('attachment.download.string'))

      expect(mockTriggerDownloadAttachment).toHaveBeenCalledWith({
        accountId: 'acc-1',
        mailKey: 'key-1',
        filename: 'file.txt',
      })
      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob)
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled()
      expect(global.URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-url')
    })

    it('logs an error and does not throw when the download fails', async () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})
      mockTriggerDownloadAttachment.mockReturnValue({
        unwrap: () => Promise.reject(new Error('boom')),
      })
      const user = userEvent.setup()
      render(
        <ComposeAttachmentList
          {...baseProps}
          attachments={[attachment({ uploadStatus: 'completed' })]}
        />
      )

      await user.click(screen.getByTitle('attachment.download.string'))

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to download attachment:',
        expect.any(Error)
      )
      consoleErrorSpy.mockRestore()
    })
  })
})
