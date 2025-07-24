import { TooltipProvider } from '@/components/ui/tooltip'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AttachmentName, MailAttachment } from '../mail-attachment'

jest.mock('next-intl', () => ({
  useTranslations: () => () => 'Download',
}))

describe('MailAttachment', () => {
  const mockPart = {
    partId: '1',
    name: 'image.png',
    contentType: 'image/png',
    size: 15432,
    downloadUri: 'http://localhost/download/1',
    displayUri: 'http://localhost/display/1',
  }

  it('renders attachment name, size and download button', () => {
    render(
      <TooltipProvider>
        <MailAttachment part={mockPart} />
      </TooltipProvider>
    )
    expect(screen.getByText('image.png')).toBeInTheDocument()
    expect(screen.getByText('15.1 Ko')).toBeInTheDocument()
    const downloadBtn = screen.getByRole('link', { name: 'Download' })
    expect(downloadBtn).toBeInTheDocument()
    expect(downloadBtn).toHaveAttribute('href', mockPart.downloadUri)
    expect(downloadBtn).toHaveAttribute('download')
    expect(downloadBtn).toHaveAttribute('target', '_blank')
    expect(downloadBtn).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('shows tooltip on download button hover', async () => {
    render(
      <TooltipProvider>
        <MailAttachment part={mockPart} />
      </TooltipProvider>
    )
    const downloadBtn = screen.getByRole('link', { name: 'Download' })
    await userEvent.hover(downloadBtn)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('Download')
  })
})

describe('AttachmentName', () => {
  it('renders name without tooltip if not long', () => {
    render(
      <TooltipProvider>
        <AttachmentName name="shortname.txt" />
      </TooltipProvider>
    )
    expect(screen.getByText('shortname.txt')).toBeInTheDocument()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('renders truncated name and tooltip if long', async () => {
    const longName = 'verylongfilenameforanattachment.pdf'
    render(
      <TooltipProvider>
        <AttachmentName name={longName} maxLength={10} />
      </TooltipProvider>
    )
    expect(screen.getByText(/verylongfi.*pdf/)).toBeInTheDocument()

    await userEvent.hover(screen.getByText(/verylongfi.*pdf/))
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent(longName)
  })
})
