import { render, screen } from '@testing-library/react'
import InstallPrompt from '../install-prompt'

jest.mock('@/lib/pwa/hooks/use-install-prompt', () => ({
  useInstallPrompt: jest.fn(),
}))

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'install.button.string': 'Install App',
      'install.installing.string': 'Installing...',
      'install.success.string': 'App installed',
      'install.error.string': 'Install failed',
    }
    return translations[key] || key
  },
}))

jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

jest.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenuItem: ({ children, ...props }: any) => (
    <div data-testid="dropdown-menu-item" {...props}>
      {children}
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  Download: () => <svg data-testid="download-icon" />,
  Loader2: () => <svg data-testid="loader-icon" />,
}))

const { useInstallPrompt } = require('@/lib/pwa/hooks/use-install-prompt')

describe('InstallPrompt', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should not render when not installable', () => {
    ;(useInstallPrompt as jest.Mock).mockReturnValue({
      isInstallable: false,
      install: jest.fn(),
    })

    const { container } = render(<InstallPrompt />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when installable', () => {
    ;(useInstallPrompt as jest.Mock).mockReturnValue({
      isInstallable: true,
      install: jest.fn(),
    })

    render(<InstallPrompt />)
    expect(screen.getByTestId('dropdown-menu-item')).toBeInTheDocument()
    expect(screen.getByText('Install App')).toBeInTheDocument()
  })
})
