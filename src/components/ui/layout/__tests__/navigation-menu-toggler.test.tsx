import '@/__mocks__/matchMedia.mock'
import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import NavigationMenuToggler from '../navigation-menu-toggler'

// Mock useHover hook to return true when testing hover
const mockUseHover = jest.fn(() => false)
jest.mock('@/hooks/useHover', () => ({
  useHover: () => mockUseHover(),
}))

// Mock NavigationToggler component
jest.mock('../navigation-toggler', () => {
  return function MockNavigationToggler() {
    return <div data-testid="navigation-toggler">Navigation Toggler</div>
  }
})

// Mock Radix UI Popover
jest.mock('@/components/ui/popover', () => ({
  Popover: ({
    children,
    open,
  }: {
    children: React.ReactNode
    open?: boolean
  }) => (
    <div data-testid="popover" data-open={open}>
      {children}
    </div>
  ),
  PopoverTrigger: React.forwardRef<
    HTMLButtonElement,
    { asChild?: boolean; children: React.ReactNode }
  >(({ children }, ref) => <div ref={ref}>{children}</div>),
  PopoverContent: ({
    children,
    align,
    side,
    className,
  }: {
    children: React.ReactNode
    align?: string
    side?: string
    className?: string
  }) => (
    <div
      data-testid="popover-content"
      data-align={align}
      data-side={side}
      className={className}
    >
      {children}
    </div>
  ),
}))

// Mock Button component
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<
    HTMLButtonElement,
    React.PropsWithChildren<{ asChild?: boolean; [key: string]: any }>
  >(({ children, ...props }, ref) => {
    const { asChild, ...domProps } = props
    return (
      <button ref={ref} {...domProps}>
        {children}
      </button>
    )
  }),
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Grid2X2: (props: any) => <div data-testid="grid2x2-icon" {...props} />,
}))

describe('NavigationMenuToggler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseHover.mockReturnValue(false)
  })

  it('should render the component', () => {
    render(<NavigationMenuToggler />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toBeInTheDocument()
  })

  it('should render the menu button with correct aria-label', () => {
    render(<NavigationMenuToggler />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toHaveAttribute('aria-label', 'Open menu')
  })

  it('should render the Grid2X2 icon', () => {
    render(<NavigationMenuToggler />)
    const icon = screen.getByTestId('grid2x2-icon')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveClass('h-7 w-7')
  })

  it('should render the popover', () => {
    render(<NavigationMenuToggler />)
    const popover = screen.getByTestId('popover')
    expect(popover).toBeInTheDocument()
  })

  it('should render popover content with correct alignment', () => {
    render(<NavigationMenuToggler />)
    const popoverContent = screen.getByTestId('popover-content')
    expect(popoverContent).toBeInTheDocument()
    expect(popoverContent).toHaveAttribute('data-align', 'start')
    expect(popoverContent).toHaveAttribute('data-side', 'right')
  })

  it('should render NavigationToggler inside popover content', () => {
    render(<NavigationMenuToggler />)
    const navigationToggler = screen.getByTestId('navigation-toggler')
    expect(navigationToggler).toBeInTheDocument()
  })

  it('should have correct classes on popover content', () => {
    render(<NavigationMenuToggler />)
    const popoverContent = screen.getByTestId('popover-content')
    expect(popoverContent).toHaveClass('w-fit', 'p-0')
  })

  it('should have correct classes on content wrapper', () => {
    render(<NavigationMenuToggler />)
    const popoverContent = screen.getByTestId('popover-content')
    // The actual content wrapper is inside the popover-content
    const contentWrapper = popoverContent?.firstElementChild
    expect(contentWrapper?.className).toContain('h-full')
    expect(contentWrapper?.className).toContain('w-full')
  })

  it('should start with popover closed', () => {
    render(<NavigationMenuToggler />)
    const popover = screen.getByTestId('popover')
    expect(popover).toHaveAttribute('data-open', 'false')
  })

  it('should open popover when navigation is hovered', () => {
    mockUseHover.mockReturnValue(true)
    render(<NavigationMenuToggler />)

    waitFor(() => {
      const popover = screen.getByTestId('popover')
      expect(popover).toHaveAttribute('data-open', 'true')
    })
  })

  it('should have button with p-0 class', () => {
    render(<NavigationMenuToggler />)
    const button = screen.getByRole('button', { name: /open menu/i })
    expect(button).toHaveClass('p-0')
  })

  it('should have icon with data-sidebar attribute', () => {
    render(<NavigationMenuToggler />)
    const icon = screen.getByTestId('grid2x2-icon')
    expect(icon).toHaveAttribute('data-sidebar', 'menu-button')
  })

  it('should match snapshot', () => {
    const { asFragment } = render(<NavigationMenuToggler />)
    expect(asFragment()).toMatchSnapshot()
  })
})
