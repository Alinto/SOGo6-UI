import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import MailContent from '../mail-content'
import type { ImapAttachments } from '@/features/mails/mails-types'

jest.mock('../mail-attachment', () => ({
  AttachmentDisplay: ({ attachments }: { attachments: { count: number } }) => (
    <div data-testid="attachment-display">Attachments: {attachments.count}</div>
  ),
}))

jest.mock('../mail-show-image', () => ({
  MailShowImage: ({ onShowImages }: { onShowImages: () => void }) => (
    <button type="button" data-testid="show-images" onClick={onShowImages}>
      Show Images
    </button>
  ),
}))

describe('MailContent', () => {
  const mockPlainBody = '<p>This is a plain email body</p>'
  const mockBase64Body =
    'PHA+VGhpcyBpcyBhIGJhc2U2NCBlbWFpbCBib2R5PC9wPg=='
  const mockBodyWithImages =
    '<p>Email with image</p><img src="http://example.com/image.jpg" />'
  const mockBodyWithScript =
    '<p>Content with script</p><script>alert("xss")</script>'
  const mockAttachments: ImapAttachments = {
    count: 2,
    parts: [
      {
        partId: '1',
        name: 'file1.pdf',
        contentType: 'application/pdf',
        size: 1024,
        downloadUri: '/dl/1',
        displayUri: '/display/1',
      },
      {
        partId: '2',
        name: 'file2.txt',
        contentType: 'text/plain',
        size: 512,
        downloadUri: '/dl/2',
        displayUri: '/display/2',
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders mail content with plain HTML', async () => {
      const { container } = render(<MailContent body={mockPlainBody} />)

      await waitFor(() => {
        const shadowHost = container.querySelector('.mail-shadow-root')
        expect(shadowHost).toBeTruthy()
        expect(shadowHost?.shadowRoot).toBeTruthy()
      })

      const shadowHost = container.querySelector('.mail-shadow-root')
      const shadowContent = shadowHost?.shadowRoot?.textContent
      expect(shadowContent).toContain('This is a plain email body')
    })

    it('renders mail content in proper container', () => {
      const { container } = render(<MailContent body={mockPlainBody} />)
      const mailContent = container.querySelector('.mail-content')
      expect(mailContent).toBeInTheDocument()
      expect(mailContent).toHaveClass('mail-content')
    })
  })

  describe('integration', () => {
    it('renders attachments when provided', () => {
      render(
        <MailContent body={mockPlainBody} attachments={mockAttachments} />
      )
      const attachmentDisplay = screen.getByTestId('attachment-display')
      expect(attachmentDisplay).toBeInTheDocument()
      expect(attachmentDisplay).toHaveTextContent('Attachments: 2')
    })

    it('does not render attachments when count is 0', () => {
      render(
        <MailContent
          body={mockPlainBody}
          attachments={{ count: 0, parts: [] }}
        />
      )
      expect(screen.queryByTestId('attachment-display')).not.toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('shows image loading button when external images are detected', () => {
      render(<MailContent body={mockBodyWithImages} />)
      expect(screen.getByTestId('show-images')).toBeInTheDocument()
    })

    it('hides image loading button after clicking show images', async () => {
      const user = userEvent.setup()
      render(<MailContent body={mockBodyWithImages} />)
      await user.click(screen.getByTestId('show-images'))
      expect(screen.queryByTestId('show-images')).not.toBeInTheDocument()
    })

    it('decodes base64 content correctly', async () => {
      const { container } = render(<MailContent body={mockBase64Body} />)

      await waitFor(() => {
        const shadowHost = container.querySelector('.mail-shadow-root')
        expect(shadowHost?.shadowRoot).toBeTruthy()
      })

      const shadowHost = container.querySelector('.mail-shadow-root')
      expect(shadowHost?.shadowRoot?.textContent).toContain(
        'This is a base64 email body'
      )
    })
  })

  describe('custom styling', () => {
    it('has proper structure with border separator', () => {
      const { container } = render(<MailContent body={mockPlainBody} />)
      const mainContainer = container.querySelector('.w-full')
      expect(mainContainer).toBeInTheDocument()
      expect(mainContainer).toHaveClass('w-full')

      const border = mainContainer?.querySelector('.border-muted')
      expect(border).toBeInTheDocument()
      expect(border).toHaveClass('my-2', 'border-t')
    })
  })

  describe('component stability', () => {
    it('sanitizes HTML content by removing scripts', async () => {
      const { container } = render(<MailContent body={mockBodyWithScript} />)

      await waitFor(() => {
        const shadowHost = container.querySelector('.mail-shadow-root')
        expect(shadowHost?.shadowRoot).toBeTruthy()
      })

      const shadowContent =
        container.querySelector('.mail-shadow-root')?.shadowRoot?.innerHTML ?? ''
      expect(shadowContent).not.toContain('<script>')
      expect(shadowContent).not.toContain('alert("xss")')
      expect(shadowContent).toContain('Content with script')
    })
  })
})
