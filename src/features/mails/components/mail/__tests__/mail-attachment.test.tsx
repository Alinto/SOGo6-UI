/* eslint-disable react/jsx-no-literals */
import { render } from '@testing-library/react'
import { AttachmentDisplay, AttachmentName, MailAttachment } from '../mail-attachment'
import type { ImapAttachmentPart, ImapAttachments } from '../types'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock lucide-react
jest.mock('lucide-react', () => ({
  ArrowDownToLine: ({ size }: { size?: number }) => <div data-testid="arrow-icon" data-size={size} />,
}))

// Mock tooltip
jest.mock('@/components/ui/tooltip', () => ({
  TooltipWrapper: ({ children, content }: { children: React.ReactNode; content: string }) =>
    <div data-testid="tooltip" data-content={content}>{children}</div>,
}))

// Mock env service
jest.mock('@/lib/env-service', () => ({
  getCachedEnvVars: () => ({ REACT_APP_API_BASE_URL: 'http://localhost:5000' }),
}))

describe('AttachmentName', () => {
  it('renders without crashing', () => {
    expect(() => render(<AttachmentName name="test.txt" />)).not.toThrow()
  })
})

describe('MailAttachment', () => {
  const mockPart: ImapAttachmentPart = {
    partId: '1',
    name: 'test.pdf',
    contentType: 'application/pdf',
    size: 1024,
    downloadUri: '/download/test.pdf',
    displayUri: '/display/test.pdf',
  }

  it('renders without crashing', () => {
    expect(() => render(<MailAttachment part={mockPart} />)).not.toThrow()
  })
})

describe('AttachmentDisplay', () => {
  const mockAttachments: ImapAttachments = {
    count: 2,
    parts: [
      {
        partId: '1',
        name: 'file1.pdf',
        contentType: 'application/pdf',
        size: 1024,
        downloadUri: '/download/file1.pdf',
        displayUri: '/display/file1.pdf',
      },
      {
        partId: '2',
        name: 'file2.txt',
        contentType: 'text/plain',
        size: 512,
        downloadUri: '/download/file2.txt',
        displayUri: '/display/file2.txt',
      },
    ],
  }

  it('renders without crashing', () => {
    expect(() => render(<AttachmentDisplay attachments={mockAttachments} />)).not.toThrow()
  })

  it('renders nothing when no attachments', () => {
    const emptyAttachments: ImapAttachments = {
      count: 0,
      parts: [],
    }
    const { container } = render(<AttachmentDisplay attachments={emptyAttachments} />)
    expect(container.firstChild).toBeNull()
  })
})