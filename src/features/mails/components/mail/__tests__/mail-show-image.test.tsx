import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MailShowImage } from '../mail-show-image'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'mail_display.content.external_images_warning.string':
        'This email contains external images. Click to display them.',
    }
    return translations[key] || key
  }),
}))

jest.mock('lucide-react', () => ({
  CloudDownload: jest.fn(({ size }) => (
    <span data-testid="cloud-download-icon" data-size={size}>
      ☁️⬇️
    </span>
  )),
  Image: jest.fn(({ size, className }) => (
    <span data-testid="image-icon" data-size={size} className={className}>
      🖼️
    </span>
  )),
}))

describe('MailShowImage', () => {
  const mockOnShowImages = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the component', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    expect(
      screen.getByText(
        'This email contains external images. Click to display them.'
      )
    ).toBeInTheDocument()
  })

  it('should render image icon', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const imageIcon = screen.getByTestId('image-icon')
    expect(imageIcon).toBeInTheDocument()
    expect(imageIcon).toHaveAttribute('data-size', '22')
  })

  it('should render cloud download icon', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const downloadIcon = screen.getByTestId('cloud-download-icon')
    expect(downloadIcon).toBeInTheDocument()
    expect(downloadIcon).toHaveAttribute('data-size', '22')
  })

  it('should call onShowImages when clicked', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen
      .getByText('This email contains external images. Click to display them.')
      .closest('div')!
    fireEvent.click(container)

    expect(mockOnShowImages).toHaveBeenCalledTimes(1)
  })

  it('should have cursor-pointer class', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen
      .getByText('This email contains external images. Click to display them.')
      .closest('div')!
    expect(container).toHaveClass('cursor-pointer')
  })

  it('should apply correct styling classes', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen
      .getByText('This email contains external images. Click to display them.')
      .closest('div')!
    expect(container).toHaveClass(
      'mb-2',
      'flex',
      'gap-2',
      'rounded',
      'px-4',
      'py-3'
    )
  })

  it('should apply chart-2 color to image icon', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const imageIcon = screen.getByTestId('image-icon')
    expect(imageIcon).toHaveClass('text-chart-2')
  })

  it('should render message text with correct styling', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const messageText = screen.getByText(
      'This email contains external images. Click to display them.'
    )
    expect(messageText).toHaveClass('text-card-foreground', 'flex-1')
  })

  it('should be clickable and call handler multiple times', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen
      .getByText('This email contains external images. Click to display them.')
      .closest('div')!

    fireEvent.click(container)
    fireEvent.click(container)
    fireEvent.click(container)

    expect(mockOnShowImages).toHaveBeenCalledTimes(3)
  })

  it('should have proper layout with flex and gap', () => {
    render(<MailShowImage onShowImages={mockOnShowImages} />)

    const container = screen
      .getByText('This email contains external images. Click to display them.')
      .closest('div')!

    expect(container).toHaveClass('flex')
    expect(container).toHaveClass('gap-2')
  })
})
