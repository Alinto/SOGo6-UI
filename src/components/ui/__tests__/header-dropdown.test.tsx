import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import HeaderDropdown from '../header-dropdown'

// filepath: /SOGo/src/components/ui/header-dropdown.test.tsx

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

// Mock next-themes
jest.mock('next-themes', () => ({
  useTheme: jest.fn(() => ({
    theme: 'light',
    setTheme: jest.fn(),
  })),
}))

// Mock the mobile hook
jest.mock('@/hooks/use-mobile', () => ({
  useIsMobile: jest.fn(() => false),
}))

// Mock the navigation router
jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}))

// Mock the theme switcher component
jest.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BookA: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="book-a-icon" />
  ),
  CalendarCog: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="calendar-cog-icon" />
  ),
  CircleUserRound: ({ className, ...props }) => (
    <div
      {...props}
      className={className}
      data-testid="circle-user-round-icon"
    />
  ),
  Cog: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="cog-icon" />
  ),
  LogOut: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="log-out-icon" />
  ),
  Mail: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="mail-icon" />
  ),
  UserRoundCog: ({ className, ...props }) => (
    <div {...props} className={className} data-testid="user-round-cog-icon" />
  ),
}))

// Mock Radix UI dropdown menu primitives directly
jest.mock('@radix-ui/react-dropdown-menu', () => {
  const React = require('react')

  const Root = ({ children }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <div>
        {React.Children.map(children, (child) =>
          React.cloneElement(child, { open, setOpen })
        )}
      </div>
    )
  }

  const Trigger = React.forwardRef(
    ({ children, open, setOpen, asChild, ...props }, ref) => {
      const { asChild: _, ...cleanProps } = props
      return React.cloneElement(children, {
        ...cleanProps,
        ref,
        onClick: () => setOpen && setOpen(!open),
      })
    }
  )
  Trigger.displayName = 'DropdownMenuTrigger'

  const Portal = ({ children }) => children
  Portal.displayName = 'DropdownMenuPortal'

  const Content = React.forwardRef(
    ({ children, open, setOpen, sideOffset, ...props }, ref) => {
      const { sideOffset: _, setOpen: __, ...cleanProps } = props
      return open ? (
        <div {...cleanProps} ref={ref}>
          {children}
        </div>
      ) : null
    }
  )
  Content.displayName = 'DropdownMenuContent'

  const Item = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref} role="menuitem">
      {children}
    </div>
  ))
  Item.displayName = 'DropdownMenuItem'

  const Label = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref} role="label">
      {children}
    </div>
  ))
  Label.displayName = 'DropdownMenuLabel'

  const Separator = React.forwardRef((props, ref) => (
    <hr {...props} ref={ref} />
  ))
  Separator.displayName = 'DropdownMenuSeparator'

  const Group = ({ children }) => <div>{children}</div>
  Group.displayName = 'DropdownMenuGroup'

  const Sub = ({ children }) => <div>{children}</div>
  Sub.displayName = 'DropdownMenuSub'

  const SubTrigger = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ))
  SubTrigger.displayName = 'DropdownMenuSubTrigger'

  const SubContent = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ))
  SubContent.displayName = 'DropdownMenuSubContent'

  const RadioGroup = ({ children }) => <div>{children}</div>
  RadioGroup.displayName = 'DropdownMenuRadioGroup'

  const CheckboxItem = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ))
  CheckboxItem.displayName = 'DropdownMenuCheckboxItem'

  const RadioItem = React.forwardRef(({ children, ...props }, ref) => (
    <div {...props} ref={ref}>
      {children}
    </div>
  ))
  RadioItem.displayName = 'DropdownMenuRadioItem'

  const Shortcut = ({ children, ...props }) => (
    <span {...props}>{children}</span>
  )
  Shortcut.displayName = 'DropdownMenuShortcut'

  return {
    Root,
    Trigger,
    Portal,
    Content,
    Item,
    Label,
    Separator,
    Group,
    RadioGroup,
    Sub,
    SubTrigger,
    SubContent,
    CheckboxItem,
    RadioItem,
    Shortcut,
  }
})

// Mock Avatar component
jest.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }) => <div className="avatar">{children}</div>,
  AvatarImage: ({ src, ...props }) => <img {...props} src={src} alt="avatar" />,
  AvatarFallback: ({ children }) => <span>{children}</span>,
}))

describe('HeaderDropdown component', () => {
  beforeEach(() => {
    useTranslations.mockReturnValue((key) => key)
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<HeaderDropdown />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders HeaderDropdown component', () => {
    render(<HeaderDropdown />)
    expect(screen.getByText('Henry Fafenback')).toBeInTheDocument()
    expect(screen.getByText('sbarre@alinto.eu')).toBeInTheDocument()
  })

  it('renders dropdown menu items', async () => {
    render(<HeaderDropdown />)

    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByText('admin.panel.string')).toBeInTheDocument()
    expect(screen.getByText('account.section.string')).toBeInTheDocument()
    expect(screen.getByText('account.profile.string')).toBeInTheDocument()
    expect(screen.getByText('account.security.string')).toBeInTheDocument()
    expect(screen.getByText('settings.title.string')).toBeInTheDocument()
    expect(screen.getByText('settings.general.string')).toBeInTheDocument()
    expect(screen.getByText('settings.agenda.string')).toBeInTheDocument()
    expect(
      screen.getByText('settings.address_books.string')
    ).toBeInTheDocument()
    expect(screen.getByText('settings.email.string')).toBeInTheDocument()
    expect(screen.getByText('logout.string')).toBeInTheDocument()
  })

  it('renders icons in dropdown menu items', () => {
    render(<HeaderDropdown />)
    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByTestId('cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('circle-user-round-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('user-round-cog-icon')).toHaveLength(2) // Used in both account security and settings general
    expect(screen.getByTestId('calendar-cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('book-a-icon')).toBeInTheDocument()
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument()
  })

  it('toggles dropdown menu on trigger click', () => {
    render(<HeaderDropdown />)
    const trigger = screen.getByTestId('header-dropdown-trigger')

    // Initially the dropdown should be closed
    expect(screen.queryByText('admin.panel.string')).not.toBeInTheDocument()

    // Click to open
    fireEvent.click(trigger)
    expect(screen.getByText('admin.panel.string')).toBeInTheDocument()

    // Click to close
    fireEvent.click(trigger)
    expect(screen.queryByText('admin.panel.string')).not.toBeInTheDocument()
  })
})
