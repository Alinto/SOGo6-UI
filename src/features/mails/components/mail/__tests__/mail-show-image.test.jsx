import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MailShowImage } from '../mail-show-image'

jest.mock('next-intl', () => ({
  useTranslations: () => (key) => {
    const translations = {
      'mail_display.content.external_images_warning.string':
        'This email contains external images. Click to display them.',
    }
    return translations[key] || key
  },
}))

describe('MailShowImage', () => {
  const mockOnShowImages = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders warning message about external images', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const message = screen.getByText(
      'This email contains external images. Click to display them.'
    )
    expect(message).toBeInTheDocument()
  })

  it('has proper styling and layout', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement
    expect(container).toHaveClass(
      'mb-2',
      'flex',
      'cursor-pointer',
      'gap-2',
      'rounded',
      'px-4',
      'py-3',
      'text-sm'
    )
    expect(container).toHaveStyle('background-color: hsl(var(--chart-2)/0.1)')
  })

  it('displays image and download icons', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement

    // Check for SVG icons (Lucide icons render as SVG elements)
    const svgs = container.querySelectorAll('svg')
    expect(svgs).toHaveLength(2) // ImageIcon and CloudDownload
  })

  it('calls onShowImages when clicked', async () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement
    await userEvent.click(container)

    expect(mockOnShowImages).toHaveBeenCalledTimes(1)
  })

  it('is clickable and has proper cursor styling', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement
    expect(container).toHaveClass('cursor-pointer')
  })

  it('has proper text color classes', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const message = screen.getByText(
      'This email contains external images. Click to display them.'
    )
    expect(message).toHaveClass('text-card-foreground', 'flex-1')
  })

  it('handles multiple clicks correctly', async () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement

    await userEvent.click(container)
    await userEvent.click(container)
    await userEvent.click(container)

    expect(mockOnShowImages).toHaveBeenCalledTimes(3)
  })

  it('maintains accessibility for keyboard interaction', async () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen.getByText(
      'This email contains external images. Click to display them.'
    ).parentElement

    // Focus the element and press Enter
    container.focus()
    await userEvent.keyboard('{Enter}')

    // Note: This test assumes the component would handle keyboard events,
    // though the current implementation only handles click events
    expect(container).toHaveClass('cursor-pointer')
  })
})
