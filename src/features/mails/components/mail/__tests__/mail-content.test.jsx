import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MailContent from '../mail-content'

jest.mock('dompurify', () => ({
  sanitize: jest.fn((html) => html),
}))

jest.mock('../mail-attachment', () => ({
  AttachmentDisplay: ({ attachments }) => (
    <div data-testid="attachment-display">Attachments: {attachments.count}</div>
  ),
}))

jest.mock('../mail-show-image', () => ({
  MailShowImage: ({ onShowImages }) => (
    <button data-testid="show-images" onClick={onShowImages}>
      Show Images
    </button>
  ),
}))

describe('MailContent', () => {
  const mockPlainBody = '<p>This is a plain email body</p>'
  const mockBase64Body = 'PHA+VGhpcyBpcyBhIGJhc2U2NCBlbWFpbCBib2R5PC9wPg==' // Base64 of '<p>This is a base64 email body</p>'
  const mockBodyWithImages =
    '<p>Email with image</p><img src="http://example.com/image.jpg" />'
  const mockAttachments = {
    count: 2,
    parts: [
      {
        partId: '1',
        name: 'file1.pdf',
        contentType: 'application/pdf',
        size: 1024,
      },
      { partId: '2', name: 'file2.txt', contentType: 'text/plain', size: 512 },
    ],
  }

  it('renders mail content with plain HTML', () => {
    render(<MailContent body={mockPlainBody} />)

    expect(screen.getByText('This is a plain email body')).toBeInTheDocument()
  })

  it('renders attachments when provided', () => {
    render(<MailContent body={mockPlainBody} attachments={mockAttachments} />)

    const attachmentDisplay = screen.getByTestId('attachment-display')
    expect(attachmentDisplay).toBeInTheDocument()
    expect(attachmentDisplay).toHaveTextContent('Attachments: 2')
  })

  it('does not render attachments when count is 0', () => {
    const noAttachments = { count: 0, parts: [] }
    render(<MailContent body={mockPlainBody} attachments={noAttachments} />)

    expect(screen.queryByTestId('attachment-display')).not.toBeInTheDocument()
  })

  it('shows image loading button when external images are detected', () => {
    render(<MailContent body={mockBodyWithImages} />)

    const showImagesButton = screen.getByTestId('show-images')
    expect(showImagesButton).toBeInTheDocument()
  })

  it('hides image loading button after clicking show images', async () => {
    render(<MailContent body={mockBodyWithImages} />)

    const showImagesButton = screen.getByTestId('show-images')
    await userEvent.click(showImagesButton)

    expect(screen.queryByTestId('show-images')).not.toBeInTheDocument()
  })

  it('decodes base64 content correctly', () => {
    render(<MailContent body={mockBase64Body} />)

    // The component should decode the base64 and render the content
    expect(screen.getByText('This is a base64 email body')).toBeInTheDocument()
  })

  it('has proper structure with border separator', () => {
    render(<MailContent body={mockPlainBody} />)

    const container = screen
      .getByText('This is a plain email body')
      .closest('.w-full')
    expect(container).toHaveClass('w-full')

    // Check for border separator
    const border = container.querySelector('.border-muted')
    expect(border).toBeInTheDocument()
    expect(border).toHaveClass('my-2', 'border-t')
  })

  it('renders mail content in proper container', () => {
    render(<MailContent body={mockPlainBody} />)

    const mailContent = screen
      .getByText('This is a plain email body')
      .closest('.mail-content')
    expect(mailContent).toBeInTheDocument()
    expect(mailContent).toHaveClass('mail-content')
  })
})
