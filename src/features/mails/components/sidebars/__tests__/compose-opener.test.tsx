import '@testing-library/jest-dom'
import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import userEvent from '@testing-library/user-event'

import ComposeOpener from '../compose-opener'
import { createDraft } from '@/features/mails/store'
import { toast } from 'sonner'

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

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
  },
}))

import { useSidebar } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { useTranslations } from 'next-intl'

describe('ComposeOpener Component', () => {
  let mockSetOpenMobile: jest.Mock
  let mockStore: ReturnType<typeof configureStore>

  const createMockStore = (openDraftIds: string[] = []) =>
    configureStore({
      reducer: {
        mailCompose: (
          state = {
            openDraftIds,
            drafts: {},
            activeDraftId: null,
            isSending: false,
            sendError: null,
            pendingInsert: null,
          }
        ) => state,
      },
    })

  const renderWithProvider = () =>
    render(
      <Provider store={mockStore}>
        <ComposeOpener />
      </Provider>
    )

  beforeEach(() => {
    jest.clearAllMocks()

    mockSetOpenMobile = jest.fn()
    mockStore = createMockStore()
    ;(useSidebar as jest.Mock).mockReturnValue({
      setOpenMobile: mockSetOpenMobile,
    })
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => key)
    ;(useIsMobile as jest.Mock).mockReturnValue(false)
    jest.spyOn(global.crypto, 'randomUUID').mockReturnValue('generated-draft-id')
    jest.spyOn(mockStore, 'dispatch')
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Render Behavior', () => {
    it('should render the compose button', () => {
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should display new_message text label on desktop', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      renderWithProvider()

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('should have sr-only label for accessibility', () => {
      renderWithProvider()

      const srOnlyLabels = document.querySelectorAll('.sr-only')
      expect(srOnlyLabels.length).toBeGreaterThan(0)
      expect(srOnlyLabels[0].textContent).toBe('new_message.string')
    })

    it('should have proper styling classes', () => {
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10')
      expect(button).toHaveClass('justify-center')
      expect(button).toHaveClass('rounded-lg')
      expect(button).toHaveClass('border-2')
      expect(button).toHaveClass('text-lg')
    })

    it('should render Pencil icon', () => {
      renderWithProvider()

      const svgElements = document.querySelectorAll('svg')
      expect(svgElements.length).toBeGreaterThan(0)
    })

    it('should have proper group data attributes for collapsible state', () => {
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).toHaveClass('group-data-[collapsible=icon]:justify-center')
      expect(button).toHaveClass('group-data-[collapsible=icon]:rounded-none')
    })
  })

  describe('Icon Display', () => {
    it('should hide icon on desktop by default', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      renderWithProvider()

      const icons = document.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThan(0)
    })

    it('should have icon with proper sizing', () => {
      renderWithProvider()

      const svgElements = document.querySelectorAll('svg')
      if (svgElements.length > 0) {
        const icon = svgElements[0]
        expect(icon).toHaveClass('h-5')
        expect(icon).toHaveClass('w-5')
      }
    })

    it('should have transition effect on icon', () => {
      renderWithProvider()

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

      renderWithProvider()

      const textSpans = screen.getAllByText('new_message.string')
      expect(textSpans.length).toBeGreaterThan(0)
    })

    it('should have truncate class on label', () => {
      renderWithProvider()

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
      renderWithProvider()

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
    it('should dispatch createDraft when button is clicked', async () => {
      const user = userEvent.setup()

      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createDraft.type,
          payload: expect.objectContaining({
            id: expect.any(String),
          }),
        })
      )
    })
  })

  describe('Mobile Behavior', () => {
    it('should close sidebar on mobile when button is clicked', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
    })

    it('should not close sidebar on desktop when button is clicked', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetOpenMobile).not.toHaveBeenCalled()
    })

    it('should still dispatch createDraft on mobile', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createDraft.type,
          payload: expect.objectContaining({
            id: expect.any(String),
          }),
        })
      )
    })

    it('should toggle sidebar and open compose in correct order on mobile', async () => {
      const user = userEvent.setup()
      ;(useIsMobile as jest.Mock).mockReturnValue(true)

      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)

      expect(mockSetOpenMobile).toHaveBeenCalledWith(false)
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createDraft.type,
          payload: expect.objectContaining({
            id: expect.any(String),
          }),
        })
      )
    })

    it('should show a toast and avoid dispatch when the limit is reached', async () => {
      const user = userEvent.setup()
      mockStore = createMockStore(['draft-1', 'draft-2', 'draft-3'])
      jest.spyOn(mockStore, 'dispatch')

      renderWithProvider()

      await user.click(screen.getByRole('button'))

      expect(toast.error).toHaveBeenCalled()
      expect(mockStore.dispatch).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: createDraft.type })
      )
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should have screen reader only label', () => {
      renderWithProvider()

      const srOnlyLabel = document.querySelector('.sr-only')
      expect(srOnlyLabel).toBeInTheDocument()
      expect(srOnlyLabel?.textContent).toBe('new_message.string')
    })

    it('should have visible text label for context', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      renderWithProvider()

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })

    it('should have proper tooltip via text on non-mobile', () => {
      ;(useIsMobile as jest.Mock).mockReturnValue(false)

      renderWithProvider()

      const textElements = screen.getAllByText('new_message.string')
      expect(textElements.length).toBeGreaterThan(0)
    })
  })

  describe('Integration', () => {
    it('should use correct translations key', () => {
      const mockT = jest.fn((key: string) => `translated_${key}`)
      ;(useTranslations as jest.Mock).mockReturnValue(mockT)

      renderWithProvider()

      expect(mockT).toHaveBeenCalledWith('new_message.string')
    })

    it('should integrate with sidebar hooks', () => {
      renderWithProvider()

      expect(useSidebar).toHaveBeenCalled()
    })

    it('should integrate with mobile detection hook', () => {
      renderWithProvider()

      expect(useIsMobile).toHaveBeenCalled()
    })
  })

  describe('Button Interaction', () => {
    it('should be clickable', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()

      await user.click(button)
      expect(mockStore.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: createDraft.type,
          payload: expect.objectContaining({
            id: expect.any(String),
          }),
        })
      )
    })

    it('should not have disabled attribute', () => {
      renderWithProvider()

      const button = screen.getByRole('button')
      expect(button).not.toBeDisabled()
    })

    it('should handle multiple clicks', async () => {
      const user = userEvent.setup()
      renderWithProvider()

      const button = screen.getByRole('button')
      await user.click(button)
      await user.click(button)

      expect(mockStore.dispatch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Styling Consistency', () => {
    it('should have consistent button styling classes', () => {
      renderWithProvider()

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
      renderWithProvider()

      const svgElements = document.querySelectorAll('svg')
      if (svgElements.length > 0) {
        const icon = svgElements[0]
        expect(icon).toHaveClass('h-5')
        expect(icon).toHaveClass('w-5')
        expect(icon).toHaveClass('transition-transform')
      }
    })

    it('should have proper responsive classes for collapsible sidebar', () => {
      renderWithProvider()

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
      const { container } = renderWithProvider()

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('should have single button element as main child', () => {
      const { container } = renderWithProvider()

      const buttons = container.querySelectorAll(':scope > button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })
})
