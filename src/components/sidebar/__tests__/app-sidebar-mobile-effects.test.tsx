import '@testing-library/jest-dom'
import { render } from '@testing-library/react'
import { AppSidebarMobileEffects } from '../app-sidebar-mobile-effects'

const mockUseCloseMobileSidebarOnNavigate = jest.fn()

jest.mock('@/hooks/use-close-mobile-sidebar-on-navigate', () => ({
  useCloseMobileSidebarOnNavigate: () => mockUseCloseMobileSidebarOnNavigate(),
}))

describe('AppSidebarMobileEffects', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders nothing to the DOM', () => {
      const { container } = render(<AppSidebarMobileEffects />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('integration', () => {
    it('invokes useCloseMobileSidebarOnNavigate on mount', () => {
      render(<AppSidebarMobileEffects />)

      expect(mockUseCloseMobileSidebarOnNavigate).toHaveBeenCalledTimes(1)
    })

    it('invokes the hook again on re-render', () => {
      const { rerender } = render(<AppSidebarMobileEffects />)

      rerender(<AppSidebarMobileEffects />)

      expect(mockUseCloseMobileSidebarOnNavigate).toHaveBeenCalledTimes(2)
    })
  })

  describe('component stability', () => {
    it('keeps rendering null across multiple renders', () => {
      const { container, rerender } = render(<AppSidebarMobileEffects />)

      expect(container.firstChild).toBeNull()

      rerender(<AppSidebarMobileEffects />)

      expect(container.firstChild).toBeNull()
    })
  })
})
