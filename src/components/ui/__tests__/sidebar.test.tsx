import '@/__mocks__/matchMedia.mock'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock next-intl navigation
jest.mock('@/lib/i18n/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  })),
  Link: ({ children, ...props }: { children: React.ReactNode }) => (
    <a {...props}>{children}</a>
  ),
  redirect: jest.fn(),
  getPathname: jest.fn(() => '/'),
}))

// Mock next/image
jest.mock('next/image', () => {
  return function MockImage({
    src,
    alt,
    ...props
  }: {
    src: string
    alt: string
    [key: string]: any
  }) {
    // Filter out Next.js specific props that aren't valid DOM attributes
    const { fill, priority, quality, sizes, ...domProps } = props
    return <img src={src} alt={alt} {...domProps} />
  }
})

// Mock Radix UI components
jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
}))

// Mock lucide-react icons
interface LucideIconProps {
  [key: string]: any
}

jest.mock('lucide-react', () => ({
  ChevronsLeft: (props: LucideIconProps) => (
    <div data-testid="chevrons-left" {...props} />
  ),
  ChevronsRight: (props: LucideIconProps) => (
    <div data-testid="chevrons-right" {...props} />
  ),
  Menu: (props: LucideIconProps) => <div data-testid="menu" {...props} />,
  Calendar: (props: LucideIconProps) => (
    <div data-testid="calendar" {...props} />
  ),
  Contact2: (props: LucideIconProps) => (
    <div data-testid="contact2" {...props} />
  ),
  Mail: (props: LucideIconProps) => <div data-testid="mail" {...props} />,
  Grid2X2: (props: LucideIconProps) => <div data-testid="grid2x2" {...props} />,
}))

// Mock use-mobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

// Mock useHover hook
jest.mock('@/hooks/useHover', () => ({
  useHover: jest.fn(() => false),
}))

// Mock other UI components that might cause issues
jest.mock('@/components/ui/button', () => ({
  Button: React.forwardRef<
    HTMLButtonElement,
    React.PropsWithChildren<{
      asChild?: boolean
      variant?: string
      size?: string
      [key: string]: any
    }>
  >(({ children, ...props }, ref) => {
    // Filter out non-DOM props
    const { asChild, variant, size, ...domProps } = props
    return (
      <button ref={ref} {...domProps}>
        {children}
      </button>
    )
  }),
}))

jest.mock('@/components/ui/input', () => ({
  Input: React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & { asChild?: boolean }
  >((props, ref) => {
    // Filter out non-DOM props
    const { asChild, ...domProps } = props
    return <input ref={ref} {...domProps} />
  }),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: (props: {
    asChild?: boolean
    orientation?: string
    decorative?: boolean
    className?: string
    [key: string]: any
  }) => {
    // Filter out non-DOM props and don't render children for hr
    const { asChild, orientation, decorative, className, ...domProps } = props
    return <hr className={className} {...domProps} />
  },
}))

jest.mock('@/components/ui/sheet', () => ({
  Sheet: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    [key: string]: any
  }) => {
    const { open, onOpenChange, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
  SheetContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    side?: string
    className?: string
    [key: string]: any
  }) => {
    const { side, className, ...domProps } = props
    return (
      <div className={className} {...domProps}>
        {children}
      </div>
    )
  },
}))

jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: (props: { className?: string; [key: string]: any }) => {
    const { className, ...domProps } = props
    return <div data-testid="skeleton" className={className} {...domProps} />
  },
}))

jest.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    open?: boolean
    onOpenChange?: (open: boolean) => void
    delayDuration?: number
    [key: string]: any
  }) => {
    const { open, onOpenChange, delayDuration, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
  TooltipContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    side?: string
    align?: string
    sideOffset?: number
    className?: string
    [key: string]: any
  }) => {
    const { side, align, sideOffset, className, ...domProps } = props
    return (
      <div className={className} {...domProps}>
        {children}
      </div>
    )
  },
  TooltipProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    delayDuration?: number
    [key: string]: any
  }) => {
    const { delayDuration, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
  TooltipTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    asChild?: boolean
    [key: string]: any
  }) => {
    const { asChild, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
}))

jest.mock('@/components/ui/toggle', () => ({
  Toggle: React.forwardRef<
    HTMLButtonElement,
    React.PropsWithChildren<Record<string, any>>
  >(({ children, ...props }, ref) => {
    // Filter out non-DOM props and convert pressed to string
    const { pressed, variant, size, ...domProps } = props
    return (
      <button ref={ref} {...domProps} aria-pressed={pressed}>
        {children}
      </button>
    )
  }),
}))

jest.mock('@/components/ui/popover', () => ({
  Popover: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: any
  }) => {
    const { open, onOpenChange, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
  PopoverContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: any
  }) => {
    const { align, side, sideOffset, className, ...domProps } = props
    return (
      <div className={className} {...domProps}>
        {children}
      </div>
    )
  },
  PopoverTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode
    [key: string]: any
  }) => {
    const { asChild, ...domProps } = props
    return <div {...domProps}>{children}</div>
  },
}))

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
} from '../sidebar'

describe('Sidebar Components', () => {
  it('renders SidebarMenuSubItem', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuSub>
              <SidebarMenuSubItem>Sub Item</SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Sub Item')).toBeInTheDocument()
  })
  it('matches snapshot for SidebarMenuSubItem', () => {
    const { asFragment } = render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuSub>
              <SidebarMenuSubItem>Sub Item</SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(asFragment()).toMatchSnapshot()
  })
  it('renders Sidebar', () => {
    render(
      <SidebarProvider>
        <Sidebar>Sidebar Content</Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Sidebar Content')).toBeInTheDocument()
  })

  it('renders SidebarContent', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarContent>Content</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('renders SidebarFooter', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarFooter>Footer</SidebarFooter>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Footer')).toBeInTheDocument()
  })

  it('renders SidebarGroup', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup>Group</SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Group')).toBeInTheDocument()
  })

  it('renders SidebarGroupAction', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup>
            <SidebarGroupAction>Action</SidebarGroupAction>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('renders SidebarGroupContent', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup>
            <SidebarGroupContent>Group Content</SidebarGroupContent>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Group Content')).toBeInTheDocument()
  })

  it('renders SidebarGroupLabel', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarGroup>
            <SidebarGroupLabel>Group Label</SidebarGroupLabel>
          </SidebarGroup>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Group Label')).toBeInTheDocument()
  })

  it('renders SidebarHeader', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>Header</SidebarHeader>
        </Sidebar>
      </SidebarProvider>
    )

    // SidebarHeader contains navigation components, so we check for those instead
    expect(screen.getAllByTestId('mail')).toHaveLength(2) // Two mail icons (one visible, one in collapsed menu)
  })

  it('renders SidebarInput', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarInput placeholder="Input" />
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByPlaceholderText('Input')).toBeInTheDocument()
  })

  it('renders SidebarInset', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarInset>Inset</SidebarInset>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Inset')).toBeInTheDocument()
  })

  it('renders SidebarMenu', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>Menu</SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('renders SidebarMenuAction', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuAction>Menu Action</SidebarMenuAction>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Menu Action')).toBeInTheDocument()
  })

  it('renders SidebarMenuBadge', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuBadge>Badge</SidebarMenuBadge>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Badge')).toBeInTheDocument()
  })

  it('renders SidebarMenuButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>Menu Button</SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Menu Button')).toBeInTheDocument()
  })

  it('renders SidebarMenuItem', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuItem>Menu Item</SidebarMenuItem>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Menu Item')).toBeInTheDocument()
  })

  it('renders SidebarMenuSub', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuSub>Sub Menu</SidebarMenuSub>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Sub Menu')).toBeInTheDocument()
  })

  it('renders SidebarMenuSubButton', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarMenu>
            <SidebarMenuSub>
              <SidebarMenuSubButton>Sub Button</SidebarMenuSubButton>
            </SidebarMenuSub>
          </SidebarMenu>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Sub Button')).toBeInTheDocument()
  })

  it('renders SidebarRail', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarRail>Rail</SidebarRail>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Rail')).toBeInTheDocument()
  })

  it('renders SidebarSeparator', () => {
    render(
      <SidebarProvider>
        <Sidebar>
          <SidebarSeparator />
        </Sidebar>
      </SidebarProvider>
    )

    // SidebarSeparator is an hr element, check for its presence
    expect(document.querySelector('hr')).toBeInTheDocument()
  })
})
