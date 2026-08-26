import { wipeOnLogout } from '@/features/offline/hooks/use-offline-draft-sync'
import { useRouter } from '@/lib/i18n/navigation'
import { useAppDispatch } from '@/lib/redux/hooks'
import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import type { ReactElement } from 'react'
import React from 'react'
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

const mockPush = jest.fn()
const mockDispatch = jest.fn()
let mockPendingCount = 0

jest.mock('@/lib/i18n/navigation', () => ({
  useRouter: jest.fn(),
}))

jest.mock('@/features/offline/hooks/use-outbox', () => ({
  useOutboxList: () => ({ pendingCount: mockPendingCount }),
}))

jest.mock('@/features/offline/db/outbox-store', () => ({
  countPendingOutbox: jest.fn(async () => mockPendingCount),
}))

jest.mock('@/features/offline/flags', () => ({
  isPwaOutboxEnabled: () => true,
}))

jest.mock('@/features/offline/auth/get-auth-token', () => ({
  getAuthUserId: () => 'jdoe@sogo.nu',
}))

jest.mock('@/features/offline/auth/redirect-after-logout', () => ({
  redirectAfterLogout: (push: (href: string) => void) => push('/auth/login'),
}))

jest.mock('@/features/offline/hooks/use-offline-draft-sync', () => ({
  wipeOnLogout: jest.fn(() => Promise.resolve()),
}))

jest.mock('@/features/offline/offline-nav-context', () => ({
  useOfflineNav: () => ({
    navigateApp: jest.fn(),
    view: { kind: 'route' },
    closeOverlay: jest.fn(),
  }),
}))

jest.mock('@/components/ui/alert-dialog', () => ({
  AlertDialog: ({
    children,
    open,
  }: {
    children?: React.ReactNode
    open?: boolean
  }) =>
    open ? <div data-testid="logout-outbox-dialog">{children}</div> : null,
  AlertDialogContent: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogFooter: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children?: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children?: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogCancel: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children?: React.ReactNode
    onClick?: () => void
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}))

// Mock the theme switcher component
jest.mock('@/components/theme-switcher', () => ({
  ThemeSwitcher: () => <div data-testid="theme-switcher">Theme Switcher</div>,
}))

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  BookA: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="book-a-icon" />
  ),
  CalendarCog: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="calendar-cog-icon" />
  ),
  CircleUserRound: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div
      {...props}
      className={className}
      data-testid="circle-user-round-icon"
    />
  ),
  Cog: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="cog-icon" />
  ),
  LogOut: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="log-out-icon" />
  ),
  Mail: ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="mail-icon" />
  ),
  UserRoundCog: ({
    className,
    ...props
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div {...props} className={className} data-testid="user-round-cog-icon" />
  ),
}))

// Mock Radix UI dropdown menu primitives directly
jest.mock('@radix-ui/react-dropdown-menu', () => {
  interface DropdownMenuContextType {
    open: boolean
    setOpen: (open: boolean) => void
  }

  interface TriggerProps extends React.HTMLAttributes<HTMLElement> {
    asChild?: boolean
    open?: boolean
    setOpen?: (open: boolean) => void
    children?: React.ReactElement
    ref?: React.Ref<HTMLElement>
  }

  interface ContentProps extends React.HTMLAttributes<HTMLElement> {
    sideOffset?: number
    open?: boolean
    setOpen?: (open: boolean) => void
    children?: React.ReactNode
    ref?: React.Ref<HTMLElement>
  }

  interface ItemProps extends React.HTMLAttributes<HTMLElement> {
    children?: React.ReactNode
    onSelect?: (event: Event) => void
    ref?: React.Ref<HTMLElement>
  }

  const Root = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = React.useState(false)
    return (
      <div>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(
                child as ReactElement<DropdownMenuContextType>,
                {
                  open,
                  setOpen,
                }
              )
            : child
        )}
      </div>
    )
  }

  const Trigger = React.forwardRef<HTMLElement, TriggerProps>(
    ({ children, open, setOpen, asChild, ...props }, ref) => {
      const { asChild: _, ...cleanProps } = props
      return React.isValidElement(children)
        ? React.cloneElement(children as ReactElement, {
            ...cleanProps,
            ref,
            onClick: () => setOpen && setOpen(!open),
          })
        : null
    }
  )
  Trigger.displayName = 'DropdownMenuTrigger'

  const Portal = ({ children }: { children?: React.ReactNode }) => children
  Portal.displayName = 'DropdownMenuPortal'

  const Content = React.forwardRef<HTMLElement, ContentProps>(
    ({ children, open, setOpen, sideOffset, ...props }, ref) => {
      const { sideOffset: _, setOpen: __, ...cleanProps } = props
      return open ? (
        <div {...cleanProps} ref={ref as React.Ref<HTMLDivElement>}>
          {children}
        </div>
      ) : null
    }
  )
  Content.displayName = 'DropdownMenuContent'

  const Item = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, onClick, onSelect, ...props }, ref) => (
      <div
        {...props}
        ref={ref as React.Ref<HTMLDivElement>}
        role="menuitem"
        onClick={(event) => {
          onSelect?.(event as unknown as Event)
          onClick?.(event)
        }}
      >
        {children}
      </div>
    )
  )
  Item.displayName = 'DropdownMenuItem'

  const Label = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>} role="label">
        {children}
      </div>
    )
  )
  Label.displayName = 'DropdownMenuLabel'

  const Separator = React.forwardRef<
    HTMLHRElement,
    React.HTMLAttributes<HTMLHRElement>
  >((props, ref) => <hr {...props} ref={ref} />)
  Separator.displayName = 'DropdownMenuSeparator'

  const Group = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  Group.displayName = 'DropdownMenuGroup'

  const Sub = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  Sub.displayName = 'DropdownMenuSub'

  const SubTrigger = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    )
  )
  SubTrigger.displayName = 'DropdownMenuSubTrigger'

  const SubContent = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    )
  )
  SubContent.displayName = 'DropdownMenuSubContent'

  const RadioGroup = ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  )
  RadioGroup.displayName = 'DropdownMenuRadioGroup'

  const CheckboxItem = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    )
  )
  CheckboxItem.displayName = 'DropdownMenuCheckboxItem'

  const RadioItem = React.forwardRef<HTMLElement, ItemProps>(
    ({ children, ...props }, ref) => (
      <div {...props} ref={ref as React.Ref<HTMLDivElement>}>
        {children}
      </div>
    )
  )
  RadioItem.displayName = 'DropdownMenuRadioItem'

  const Shortcut = ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLSpanElement> & {
    children?: React.ReactNode
  }) => <span {...props}>{children}</span>
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
  Avatar: ({ children }: { children?: React.ReactNode }) => (
    <div className="avatar">{children}</div>
  ),
  AvatarImage: ({
    src,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src?: string }) => (
    <img {...props} src={src} alt="avatar" />
  ),
  AvatarFallback: ({ children }: { children?: React.ReactNode }) => (
    <span>{children}</span>
  ),
}))

// Mock useProfile hook
jest.mock('@/features/user-profile/hooks/use-profile', () => ({
  useProfile: jest.fn(() => ({
    user: {
      uid: 'jdoe@sogo.nu',
      cn: 'John Doe',
      email: 'jdoe@sogo.nu',
      domain: 'sogo.nu',
    },
    isLoading: false,
    isError: false,
    profile: null,
    mainAccount: null,
    externalAccounts: [],
    allMailboxes: [],
    defaultIdentity: null,
    preferences: null,
    language: null,
    timezone: null,
    firstModule: null,
    mfaEnabled: false,
    uiSettings: null,
    canAddExternalAccount: false,
    identitiesEnabled: false,
    customFromEnabled: false,
    moduleAccess: [],
    mfaAvailable: false,
    passwordChangeEnabled: false,
    error: undefined,
    refetch: jest.fn(),
  })),
}))

// Mock useAppSelector
jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn(() => ({
    uid: 'jdoe@sogo.nu',
    cn: 'John Doe',
    email: 'jdoe@sogo.nu',
  })),
  useAppDispatch: jest.fn(),
  useAppStore: jest.fn(),
}))

// Mock Skeleton component
jest.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div className={className} data-testid="skeleton" />
  ),
}))

describe('HeaderDropdown component', () => {
  beforeEach(() => {
    mockPendingCount = 0
    mockPush.mockReset()
    mockDispatch.mockReset()
    ;(wipeOnLogout as jest.Mock).mockClear()
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => key)
    ;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
    ;(useAppDispatch as jest.Mock).mockReturnValue(mockDispatch)
  })

  it('matches snapshot', () => {
    const { asFragment } = render(<HeaderDropdown />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders HeaderDropdown component', () => {
    render(<HeaderDropdown />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('jdoe@sogo.nu')).toBeInTheDocument()
  })

  it('renders dropdown menu items', async () => {
    render(<HeaderDropdown />)

    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByText('account.section.string')).toBeInTheDocument()
    expect(screen.getByText('account.profile.string')).toBeInTheDocument()
    expect(screen.getByText('account.security.string')).toBeInTheDocument()
    expect(screen.getByText('settings.title.string')).toBeInTheDocument()
    expect(screen.getByText('settings.general.string')).toBeInTheDocument()
    expect(screen.getByText('settings.calendar.string')).toBeInTheDocument()
    expect(
      screen.getByText('settings.address_books.string')
    ).toBeInTheDocument()
    expect(screen.getByText('settings.email.string')).toBeInTheDocument()
    expect(screen.getByText('logout.string')).toBeInTheDocument()
  })

  it('renders icons in dropdown menu items', () => {
    render(<HeaderDropdown />)
    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    expect(screen.getByTestId('circle-user-round-icon')).toBeInTheDocument()
    expect(screen.getAllByTestId('user-round-cog-icon')).toHaveLength(2) // Used in both account security and settings general
    expect(screen.getByTestId('calendar-cog-icon')).toBeInTheDocument()
    expect(screen.getByTestId('book-a-icon')).toBeInTheDocument()
    expect(screen.getByTestId('mail-icon')).toBeInTheDocument()
    expect(screen.getByTestId('log-out-icon')).toBeInTheDocument()
  })

  it('logs out immediately when the outbox is empty', async () => {
    render(<HeaderDropdown />)
    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    fireEvent.click(screen.getByText('logout.string'))

    expect(screen.queryByTestId('logout-outbox-dialog')).not.toBeInTheDocument()
    await waitFor(() => {
      expect(wipeOnLogout).toHaveBeenCalledWith('jdoe@sogo.nu')
      expect(mockDispatch).toHaveBeenCalled()
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })

  it('warns before logout when the outbox has pending messages', async () => {
    mockPendingCount = 2
    render(<HeaderDropdown />)
    fireEvent.click(screen.getByTestId('header-dropdown-trigger'))
    fireEvent.click(screen.getByText('logout.string'))

    await waitFor(() => {
      expect(screen.getByTestId('logout-outbox-dialog')).toBeInTheDocument()
    })
    expect(
      screen.getByText('logout_outbox_confirm_title.string')
    ).toBeInTheDocument()
    expect(wipeOnLogout).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('outbox_cancel.string'))
    expect(wipeOnLogout).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('logout.string'))
    await waitFor(() => {
      expect(screen.getByTestId('logout-outbox-dialog')).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText('logout_outbox_confirm_action.string'))
    expect(wipeOnLogout).toHaveBeenCalledWith('jdoe@sogo.nu')
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/auth/login')
    })
  })
})
