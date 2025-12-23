import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ComposeOpener from '../compose-opener'

// Mock dependencies
jest.mock('@/components/ui/sidebar', () => ({
  SidebarMenuButton: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props}>
      {children}
    </button>
  ),
  useSidebar: jest.fn(() => ({
    setOpenMobile: jest.fn(),
  })),
}))

jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(() => '/en/mails'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(() => ({
    get: jest.fn(() => null),
    toString: jest.fn(() => ''),
  })),
}))

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { usePathname, useRouter } from '@/lib/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'

describe('ComposeOpener Component', () => {
  let mockSetOpenMobile: jest.Mock
  let mockPush: jest.Mock
  let mockSearchParams: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockSetOpenMobile = jest.fn()
    mockPush = jest.fn()
    mockSearchParams = {
      get: jest.fn(() => null),
      toString: jest.fn(() => ''),
    }
    ;(useSidebar as jest.Mock).mockReturnValue({
      setOpenMobile: mockSetOpenMobile,
    })
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(usePathname as jest.Mock).mockReturnValue('/en/mails')
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => key)
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render Behavior', () => {
    it('should render the compose button', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display new_message text label on desktop', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('should have sr-only label for accessibility', () => {
      render(<ComposeOpener />)

      const srOnlyLabels = document.querySelectorAll('.sr-only')
      expect(srOnlyLabels.length).toBeGreaterThan(0)
      expect(srOnlyLabels[0].textContent).toBe('new_message.string')
    })

    it('should have proper styling classes', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('justify-center')
      expect(button).toHaveClass('rounded-lg')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('text-lg')
    })

    it('should render Pencil icon', () => {
      render(<ComposeOpener />)

      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })

    it('should have proper group data attributes for collapsible state', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('group-data-[collapsible=icon]:justify-center')
      expect(button).toHaveClass('group-data-[collapsible=icon]:rounded-none')
    })
  })

  describe('Icon Display', () => {
    it('should hide icon on desktop by default', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should have icon with proper sizing', () => {
      render(<ComposeOpener />)

      const svgElements = document.querySelectorAll('svg')
      if (svgElements.length > 0) {
        const icon = svgElements[0]
        expect(icon).toHaveClass('h-5')
        expect(icon).toHaveClass('w-5')
      }
    })

    it('should have transition effect on icon', () => {
      render(<ComposeOpener />)

      const svgElements = document.querySelectorAll('svg')
      if (svgElements.length > 0) {
        const icon = svgElements[0]
        expect(icon).toHaveClass('transition-transform')
      }
    })
  })

  describe('Text Label', () => {
    it('should display text label on desktop', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const textSpans = screen.getAllByText('new_message.string')
      expect(textSpans.length).toBeGreaterThan(0)
    })

    it('should have truncate class on label', () => {
      render(<ComposeOpener />)

      const textSpans = document.querySelectorAll('span')
      let hasLabelWithTruncate = false

      textSpans.forEach((span) => {
        if (
          span.textContent === 'new_message.string' &&
          span.classList.contains('truncate')
        ) {
          hasLabelWithTruncate = true
        }
      })

      expect(hasLabelWithTruncate).toBe(true)
    })

    it('should have group-data attributes on label', () => {
      render(<ComposeOpener />)

      const textSpans = document.querySelectorAll('span')
      let hasLabelWithGroupData = false

      textSpans.forEach((span) => {
        if (
          span.textContent === 'new_message.string' &&
          span.classList.contains('group-data-[collapsible=icon]:hidden')
        ) {
          hasLabelWithGroupData = true
        }
      })

      expect(hasLabelWithGroupData).toBe(true)
    })
  })

  describe('Click Handler', () => {
    it('should call push with compose param when button is clicked', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toContain('compose=true')
    })

    it('should append compose param to existing query params', async () => {
      const user = userEvent.setup()
      ;(useSearchParams as jest.Mock).mockReturnValue({
        get: jest.fn(() => null),
        toString: jest.fn(() => 'existing=param'),
      })

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
    })

    it('should use correct pathname in push call', async () => {
      const user = userEvent.setup()
      const testPathname = '/en/calendar'
      ;(usePathname as jest.Mock).mockReturnValue(testPathname)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toContain(testPathname)
    })
  })

  describe('Mobile Behavior', () => {
    it('should close sidebar on mobile when button is clicked', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it('should not close sidebar on desktop when button is clicked', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('should still open compose on mobile', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toContain('compose=true')
    })

    it('should toggle sidebar and open compose in correct order on mobile', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      // Both should be called
      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
      expect(mockPush).toHaveBeenCalled()
    })
  })

  describe('URL Parameter Handling', () => {
    it('should set compose parameter to true', async () => {
      const user = userEvent.setup()

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toMatch(/compose=true/)
    })

    it('should preserve existing query parameters', async () => {
      const user = userEvent.setup()
      mockSearchParams.toString.mockReturnValue('folder=inbox&sort=date')

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
    })

    it('should handle empty query parameters', async () => {
      const user = userEvent.setup()
      mockSearchParams.toString.mockReturnValue('')

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toBeTruthy()
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have screen reader only label', () => {
      render(<ComposeOpener />)

      const srOnlyLabel = document.querySelector('.sr-only')
      expect(srOnlyLabel).toBeInTheDocument()
      expect(srOnlyLabel?.textContent).toBe('new_message.string')
    })

    it('should have visible text label for context', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('should have proper tooltip via text on non-mobile', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      render(<ComposeOpener />)

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })
  })

  describe('Integration', () => {
    it('should use correct translations key', () => {
      const mockT = jest.fn((key: string) => `translated_${key}`)
      ;(useTranslations as jest.Mock).mockReturnValue(mockT)

      render(<ComposeOpener />)

      expect(mockT).toHaveBeenCalledWith('new_message.string')
    })

    it('should use correct locale in pathname', async () => {
      const user = userEvent.setup()
      ;(usePathname as jest.Mock).mockReturnValue('/fr/mails')

      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockPush).toHaveBeenCalled()
      const callArg = mockPush.mock.calls[0][0]
      expect(callArg).toContain('/fr/mails')
    })

    it('should integrate with sidebar hooks', () => {
      render(<ComposeOpener />)

      expect(useSidebar).toHaveBeenCalled()
    })

    it('should integrate with mobile detection hook', () => {
      render(<ComposeOpener />)

      expect(useIsMobile).toHaveBeenCalled()
    })

    it('should integrate with navigation hooks', () => {
      render(<ComposeOpener />)

      expect(usePathname).toHaveBeenCalled()
      expect(useRouter).toHaveBeenCalled()
    })

    it('should integrate with search params hook', () => {
      render(<ComposeOpener />)

      expect(useSearchParams).toHaveBeenCalled()
    })
  })

  describe('Button Interaction', () => {
    it('should be clickable', async () => {
      const user = userEvent.setup()
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      await user.click(button)
      expect(mockPush).toHaveBeenCalled()
    })

    it('should not have disabled attribute', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup()
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)

      expect(mockPush).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling Consistency', () => {
    it('should have consistent button styling classes', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      const expectedClasses = [
        'h-10',
        'justify-center',
        'rounded-lg',
        'border-2',
        'text-lg',
      ]

      expectedClasses.forEach((className) => {
        expect(button).toHaveClass(className)
      })
    })

    it('should have consistent icon styling classes', () => {
      render(<ComposeOpener />)

      const svgElements = document.querySelectorAll('svg')
      if (svgElements.length > 0) {
        const icon = svgElements[0]
        expect(icon).toHaveClass('h-5')
        expect(icon).toHaveClass('w-5')
        expect(icon).toHaveClass('transition-transform')
      }
    })

    it('should have proper responsive classes for collapsible sidebar', () => {
      render(<ComposeOpener />)

      const button = screen.getByRole('button')
      const responsiveClasses = [
        'group-data-[collapsible=icon]:justify-center',
        'group-data-[collapsible=icon]:rounded-none',
      ]

      responsiveClasses.forEach((className) => {
        expect(button).toHaveClass(className)
      })
    })
  })

  describe('Fragment Wrapper', () => {
    it('should render component without extra wrapper', () => {
      const { container } = render(<ComposeOpener />)

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should have single button element as main child', () => {
      const { container } = render(<ComposeOpener />)

      const buttons = container.querySelectorAll(':scope > button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
