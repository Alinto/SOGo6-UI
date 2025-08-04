import { fireEvent, render, screen } from '@testing-library/react'
import { ThemeSwitcher } from '../theme-switcher'

// Mock next-themes
const mockSetTheme = jest.fn()
const mockTheme = jest.fn()

jest.mock('next-themes', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
    theme: mockTheme(),
  }),
}))

// Mock next-intl
const mockTranslations: Record<string, string> = {
  'theme.dark.string': 'Dark Mode',
  'theme.light.string': 'Light Mode',
  'theme.system.string': 'System',
  'theme.dyslexia.string': 'Dyslexia',
  'theme.tritanopia.string': 'Tritanopia',
  'theme.deuteranopia.string': 'Deuteranopia',
  'theme.protanopia.string': 'Protanopia',
}

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => mockTranslations[key] || key,
}))

// Mock Lucide icons
jest.mock('lucide-react', () => ({
  ChevronDown: ({ className }: { className?: string }) => (
    <div data-testid="chevron-down-icon" className={className}>
      ChevronDown
    </div>
  ),
  ComputerIcon: ({ className }: { className?: string }) => (
    <div data-testid="computer-icon" className={className}>
      ComputerIcon
    </div>
  ),
  Moon: ({ className }: { className?: string }) => (
    <div data-testid="moon-icon" className={className}>
      Moon
    </div>
  ),
  Sun: ({ className }: { className?: string }) => (
    <div data-testid="sun-icon" className={className}>
      Sun
    </div>
  ),
}))

// Mock UI components
jest.mock('../ui/collapsible', () => ({
  Collapsible: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="collapsible">{children}</div>
  ),
  CollapsibleContent: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <div data-testid="collapsible-content" className={className}>
      {children}
    </div>
  ),
  CollapsibleTrigger: ({
    children,
    className,
  }: {
    children: React.ReactNode
    className?: string
  }) => (
    <button data-testid="collapsible-trigger" className={className}>
      {children}
    </button>
  ),
}))

jest.mock('../ui/toggle', () => ({
  Toggle: ({
    children,
    pressed,
    onClick,
    'aria-label': ariaLabel,
    title,
    size,
  }: {
    children: React.ReactNode
    pressed: boolean
    onClick: () => void
    'aria-label': string
    title: string
    size: string
  }) => (
    <button
      data-testid={`toggle-${ariaLabel?.toLowerCase().replace(/\s+/g, '-')}`}
      data-pressed={pressed}
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      data-size={size}
    >
      {children}
    </button>
  ),
}))

describe('ThemeSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTheme.mockReturnValue('light')
  })

  describe('basic rendering', () => {
    it('should render all main theme toggle buttons', () => {
      render(<ThemeSwitcher />)

      // Check for main theme buttons
      expect(screen.getByTestId('toggle-dark-mode')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-light-mode')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-system')).toBeInTheDocument()

      // Check for icons
      expect(screen.getByTestId('moon-icon')).toBeInTheDocument()
      expect(screen.getByTestId('sun-icon')).toBeInTheDocument()
      expect(screen.getByTestId('computer-icon')).toBeInTheDocument()
    })

    it('should render collapsible trigger', () => {
      render(<ThemeSwitcher />)

      expect(screen.getByTestId('collapsible-trigger')).toBeInTheDocument()
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument()
    })

    it('should render accessibility-focused theme options in collapsible content', () => {
      render(<ThemeSwitcher />)

      expect(screen.getByTestId('toggle-dyslexia')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-tritanopia')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-deuteranopia')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-protanopia')).toBeInTheDocument()
    })
  })

  describe('theme selection', () => {
    it('should highlight the currently selected theme', () => {
      mockTheme.mockReturnValue('dark')
      render(<ThemeSwitcher />)

      const darkToggle = screen.getByTestId('toggle-dark-mode')
      const lightToggle = screen.getByTestId('toggle-light-mode')
      const systemToggle = screen.getByTestId('toggle-system')

      expect(darkToggle).toHaveAttribute('data-pressed', 'true')
      expect(lightToggle).toHaveAttribute('data-pressed', 'false')
      expect(systemToggle).toHaveAttribute('data-pressed', 'false')
    })

    it('should call setTheme when dark mode is clicked', () => {
      render(<ThemeSwitcher />)

      const darkToggle = screen.getByTestId('toggle-dark-mode')
      fireEvent.click(darkToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('dark')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should call setTheme when light mode is clicked', () => {
      render(<ThemeSwitcher />)

      const lightToggle = screen.getByTestId('toggle-light-mode')
      fireEvent.click(lightToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('light')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should call setTheme when system mode is clicked', () => {
      render(<ThemeSwitcher />)

      const systemToggle = screen.getByTestId('toggle-system')
      fireEvent.click(systemToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('system')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })
  })

  describe('accessibility themes', () => {
    it('should call setTheme when dyslexia theme is clicked', () => {
      render(<ThemeSwitcher />)

      const dyslexiaToggle = screen.getByTestId('toggle-dyslexia')
      fireEvent.click(dyslexiaToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('dyslexia')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should call setTheme when tritanopia theme is clicked', () => {
      render(<ThemeSwitcher />)

      const tritanopiaToggle = screen.getByTestId('toggle-tritanopia')
      fireEvent.click(tritanopiaToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('tritanopia')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should call setTheme when deuteranopia theme is clicked', () => {
      render(<ThemeSwitcher />)

      const deuteranopiaToggle = screen.getByTestId('toggle-deuteranopia')
      fireEvent.click(deuteranopiaToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('deuteranopia')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should call setTheme when protanopia theme is clicked', () => {
      render(<ThemeSwitcher />)

      const protanopiaToggle = screen.getByTestId('toggle-protanopia')
      fireEvent.click(protanopiaToggle)

      expect(mockSetTheme).toHaveBeenCalledWith('protanopia')
      expect(mockSetTheme).toHaveBeenCalledTimes(1)
    })

    it('should highlight accessibility theme when selected', () => {
      mockTheme.mockReturnValue('dyslexia')
      render(<ThemeSwitcher />)

      const dyslexiaToggle = screen.getByTestId('toggle-dyslexia')
      expect(dyslexiaToggle).toHaveAttribute('data-pressed', 'true')

      // Other themes should not be pressed
      const darkToggle = screen.getByTestId('toggle-dark-mode')
      expect(darkToggle).toHaveAttribute('data-pressed', 'false')
    })
  })

  describe('accessibility', () => {
    it('should have proper aria-labels for all theme toggles', () => {
      render(<ThemeSwitcher />)

      expect(screen.getByTestId('toggle-dark-mode')).toHaveAttribute(
        'aria-label',
        'Dark Mode'
      )
      expect(screen.getByTestId('toggle-light-mode')).toHaveAttribute(
        'aria-label',
        'Light Mode'
      )
      expect(screen.getByTestId('toggle-system')).toHaveAttribute(
        'aria-label',
        'System'
      )
      expect(screen.getByTestId('toggle-dyslexia')).toHaveAttribute(
        'aria-label',
        'Dyslexia'
      )
      expect(screen.getByTestId('toggle-tritanopia')).toHaveAttribute(
        'aria-label',
        'Tritanopia'
      )
      expect(screen.getByTestId('toggle-deuteranopia')).toHaveAttribute(
        'aria-label',
        'Deuteranopia'
      )
      expect(screen.getByTestId('toggle-protanopia')).toHaveAttribute(
        'aria-label',
        'Protanopia'
      )
    })

    it('should have proper title attributes for tooltips', () => {
      render(<ThemeSwitcher />)

      expect(screen.getByTestId('toggle-dark-mode')).toHaveAttribute(
        'title',
        'Dark Mode'
      )
      expect(screen.getByTestId('toggle-light-mode')).toHaveAttribute(
        'title',
        'Light Mode'
      )
      expect(screen.getByTestId('toggle-system')).toHaveAttribute(
        'title',
        'System'
      )
      expect(screen.getByTestId('toggle-dyslexia')).toHaveAttribute(
        'title',
        'Dyslexia'
      )
    })

    it('should use consistent button sizing', () => {
      render(<ThemeSwitcher />)

      const allToggles = [
        'toggle-dark-mode',
        'toggle-light-mode',
        'toggle-system',
        'toggle-dyslexia',
        'toggle-tritanopia',
        'toggle-deuteranopia',
        'toggle-protanopia',
      ]

      allToggles.forEach((testId) => {
        expect(screen.getByTestId(testId)).toHaveAttribute('data-size', 'sm')
      })
    })
  })

  describe('component structure', () => {
    it('should have proper container structure', () => {
      render(<ThemeSwitcher />)

      const container = screen.getByTestId('collapsible').parentElement
      expect(container).toHaveClass(
        'flex',
        'items-center',
        'justify-center',
        'gap-2'
      )
    })

    it('should have collapsible content with proper styling', () => {
      render(<ThemeSwitcher />)

      const collapsibleContent = screen.getByTestId('collapsible-content')
      expect(collapsibleContent).toHaveClass('flex', 'flex-col', 'gap-2')
    })

    it('should have collapsible trigger with proper styling', () => {
      render(<ThemeSwitcher />)

      const collapsibleTrigger = screen.getByTestId('collapsible-trigger')
      expect(collapsibleTrigger).toHaveClass('cursor-pointer')
    })

    it('should have chevron icon with proper styling', () => {
      render(<ThemeSwitcher />)

      const chevronIcon = screen.getByTestId('chevron-down-icon')
      expect(chevronIcon).toHaveClass('text-muted-foreground', 'pt-2')
    })
  })

  describe('theme switching workflow', () => {
    it('should allow switching between different themes', () => {
      const { rerender } = render(<ThemeSwitcher />)

      // Start with light theme
      mockTheme.mockReturnValue('light')
      rerender(<ThemeSwitcher />)
      expect(screen.getByTestId('toggle-light-mode')).toHaveAttribute(
        'data-pressed',
        'true'
      )

      // Switch to dark theme
      fireEvent.click(screen.getByTestId('toggle-dark-mode'))
      expect(mockSetTheme).toHaveBeenCalledWith('dark')

      // Simulate theme change
      mockTheme.mockReturnValue('dark')
      rerender(<ThemeSwitcher />)
      expect(screen.getByTestId('toggle-dark-mode')).toHaveAttribute(
        'data-pressed',
        'true'
      )
      expect(screen.getByTestId('toggle-light-mode')).toHaveAttribute(
        'data-pressed',
        'false'
      )
    })

    it('should handle accessibility theme selection independently', () => {
      render(<ThemeSwitcher />)

      // Select an accessibility theme
      fireEvent.click(screen.getByTestId('toggle-dyslexia'))
      expect(mockSetTheme).toHaveBeenCalledWith('dyslexia')

      // Select another accessibility theme
      fireEvent.click(screen.getByTestId('toggle-protanopia'))
      expect(mockSetTheme).toHaveBeenCalledWith('protanopia')

      expect(mockSetTheme).toHaveBeenCalledTimes(2)
    })
  })

  describe('internationalization', () => {
    it('should display translated text for accessibility themes', () => {
      render(<ThemeSwitcher />)

      // Text content should be displayed for accessibility themes
      expect(screen.getByText('Dyslexia')).toBeInTheDocument()
      expect(screen.getByText('Tritanopia')).toBeInTheDocument()
      expect(screen.getByText('Deuteranopia')).toBeInTheDocument()
      expect(screen.getByText('Protanopia')).toBeInTheDocument()
    })

    it('should handle missing translations gracefully', () => {
      // Mock a scenario where translation is missing
      jest.doMock('next-intl', () => ({
        useTranslations: () => (key: string) => key, // Return key if translation missing
      }))

      render(<ThemeSwitcher />)

      // Should still render even with missing translations
      expect(screen.getByTestId('toggle-dark-mode')).toBeInTheDocument()
      expect(screen.getByTestId('toggle-light-mode')).toBeInTheDocument()
    })
  })
})
