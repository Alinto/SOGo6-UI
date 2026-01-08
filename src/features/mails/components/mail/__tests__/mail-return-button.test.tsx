import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { MailReturnButton } from '../mail-return-button'

const mockPush = jest.fn()
const mockUseParams = jest.fn()

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
  })),
}))

jest.mock('next/navigation', () => ({
  useParams: () => mockUseParams(),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => {
    const translations: Record<string, string> = {
      'return.string': 'Return to folder',
    }
    return translations[key] || key
  }),
}))

jest.mock('lucide-react', () => ({
  ArrowLeft: jest.fn(({ size }) => (
    <span data-testid="arrow-left-icon" data-size={size}>
      ←
    </span>
  )),
}))

jest.mock('@/components/ui/buttons/tooltip-button', () => ({
  TooltipButton: jest.fn(({ children, onClick, tooltip, ...props }) => (
    <button onClick={onClick} data-tooltip={tooltip} {...props}>
      {children}
    </button>
  )),
}))

describe('MailReturnButton', () => {
  const mockProps = {
    folderPath: 'inbox',
    tooltip: 'Go back to inbox',
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseParams.mockReturnValue({ account: 'test@example.com' })
  })

  it('should render the return button', () => {
    render(<MailReturnButton {...mockProps} />)

    expect(screen.getByRole('button')).toBeInTheDocument()
    expect(screen.getByTestId('arrow-left-icon')).toBeInTheDocument()
  })

  it('should render ArrowLeft icon with correct size', () => {
    render(<MailReturnButton {...mockProps} />)

    const icon = screen.getByTestId('arrow-left-icon')
    expect(icon).toHaveAttribute('data-size', '20')
  })

  it('should navigate to folder path when clicked', () => {
    render(<MailReturnButton {...mockProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/u/test@example.com/inbox')
  })

  it('should encode folder path when navigating', () => {
    const propsWithSpecialChars = {
      folderPath: 'folder with spaces',
      tooltip: 'Return',
    }
    render(<MailReturnButton {...propsWithSpecialChars} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith(
      '/u/test@example.com/folder%20with%20spaces'
    )
  })

  it('should use custom tooltip when provided', () => {
    render(<MailReturnButton {...mockProps} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-tooltip', 'Go back to inbox')
  })

  it('should use default tooltip when not provided', () => {
    const propsWithoutTooltip = {
      folderPath: 'inbox',
    }
    render(<MailReturnButton {...propsWithoutTooltip} />)

    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('data-tooltip', 'Return to folder')
  })

  it('should apply custom className when provided', () => {
    const propsWithClassName = {
      ...mockProps,
      className: 'custom-class',
    }
    render(<MailReturnButton {...propsWithClassName} />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should use account from params in navigation path', () => {
    mockUseParams.mockReturnValue({ account: 'different@example.com' })
    render(<MailReturnButton {...mockProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledWith('/u/different@example.com/inbox')
  })

  it('should handle multiple clicks correctly', () => {
    render(<MailReturnButton {...mockProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)
    fireEvent.click(button)

    expect(mockPush).toHaveBeenCalledTimes(2)
    expect(mockPush).toHaveBeenCalledWith('/u/test@example.com/inbox')
  })
})
