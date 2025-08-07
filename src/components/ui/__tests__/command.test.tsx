import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '../command'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  SearchIcon: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="search-icon">
      <path />
    </svg>
  ),
}))

// Mock CMDK components
jest.mock('cmdk', () => ({
  Command: React.forwardRef<any, any>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="cmdk-command"
        data-slot="command"
        {...props}
      >
        {children}
      </div>
    )
  ),
}))

// Mock specific CMDK sub-components that are used
const mockCmdkComponents = {
  Input: React.forwardRef<any, any>(({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={className}
      data-testid="cmdk-input"
      data-slot="command-input"
      {...props}
    />
  )),
  List: React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      data-testid="cmdk-list"
      data-slot="command-list"
      {...props}
    >
      {children}
    </div>
  )),
  Empty: React.forwardRef<any, any>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="cmdk-empty"
        data-slot="command-empty"
        {...props}
      >
        {children || 'No results found.'}
      </div>
    )
  ),
  Group: React.forwardRef<any, any>(
    ({ className, children, ...props }, ref) => (
      <div
        ref={ref}
        className={className}
        data-testid="cmdk-group"
        data-slot="command-group"
        {...props}
      >
        {children}
      </div>
    )
  ),
  Item: React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      data-testid="cmdk-item"
      data-slot="command-item"
      role="option"
      {...props}
    >
      {children}
    </div>
  )),
  Separator: React.forwardRef<any, any>(({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={className}
      data-testid="cmdk-separator"
      data-slot="command-separator"
      {...props}
    />
  )),
}

// Add the sub-components to the main Command mock
Object.assign(jest.requireMock('cmdk').Command, mockCmdkComponents)

// Mock Dialog components
jest.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange, ...otherProps }: any) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
      if (typeof open === 'boolean') {
        setIsOpen(open)
      }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
      setIsOpen(newOpen)
      if (onOpenChange) {
        onOpenChange(newOpen)
      }
    }

    return (
      <div data-testid="dialog-root" {...otherProps}>
        {React.Children.map(children, (child) =>
          React.isValidElement(child)
            ? React.cloneElement(child as React.ReactElement<any>, {
                isOpen,
                onOpenChange: handleOpenChange,
              })
            : child
        )}
      </div>
    )
  },
  DialogContent: ({
    children,
    className,
    showCloseButton = true,
    isOpen,
    ...props
  }: any) =>
    isOpen ? (
      <div
        className={className}
        data-testid="dialog-content"
        data-show-close-button={showCloseButton}
      >
        {children}
      </div>
    ) : null,
  DialogHeader: ({ children, className, ...props }: any) => (
    <div className={className} data-testid="dialog-header">
      {children}
    </div>
  ),
  DialogTitle: ({ children, ...props }: any) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children, ...props }: any) => (
    <p data-testid="dialog-description">{children}</p>
  ),
}))

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// filepath: /SOGo/src/components/ui/command.test.tsx

describe('Command component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<Command />)
      expect(screen.getByTestId('cmdk-command')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(
        <Command>
          <div>Test content</div>
        </Command>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with children', () => {
      render(
        <Command>
          <div data-testid="test-child">Test content</div>
        </Command>
      )

      expect(screen.getByTestId('cmdk-command')).toBeInTheDocument()
      expect(screen.getByTestId('test-child')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<Command />)

      const command = screen.getByTestId('cmdk-command')
      expect(command).toHaveClass(
        'bg-popover text-popover-foreground flex h-full w-full flex-col overflow-hidden rounded-md'
      )
    })

    it('applies custom className', () => {
      render(<Command className="custom-class" />)

      const command = screen.getByTestId('cmdk-command')
      expect(command).toHaveClass('custom-class')
    })

    it('forwards props to CMDK Command', () => {
      render(<Command data-custom="test-value" />)

      const command = screen.getByTestId('cmdk-command')
      expect(command).toHaveAttribute('data-custom', 'test-value')
    })

    it('has correct data-slot attribute', () => {
      render(<Command />)

      const command = screen.getByTestId('cmdk-command')
      expect(command).toHaveAttribute('data-slot', 'command')
    })
  })

  describe('Ref forwarding', () => {
    it('forwards ref correctly', () => {
      const ref = React.createRef<HTMLDivElement>()
      render(<Command ref={ref} />)

      expect(ref.current).toBeInstanceOf(HTMLDivElement)
    })
  })
})

describe('CommandDialog component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandDialog open />)
      expect(screen.getByTestId('dialog-root')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(
        <CommandDialog open>
          <div>Dialog content</div>
        </CommandDialog>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with default title and description', () => {
      render(<CommandDialog open />)

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Command Palette'
      )
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Search for a command to run...'
      )
    })

    it('renders with custom title and description', () => {
      render(
        <CommandDialog
          open
          title="Custom Title"
          description="Custom description"
        />
      )

      expect(screen.getByTestId('dialog-title')).toHaveTextContent(
        'Custom Title'
      )
      expect(screen.getByTestId('dialog-description')).toHaveTextContent(
        'Custom description'
      )
    })

    it('renders DialogHeader with sr-only class', () => {
      render(<CommandDialog open />)

      const header = screen.getByTestId('dialog-header')
      expect(header).toHaveClass('sr-only')
    })

    it('renders DialogContent with correct className', () => {
      render(<CommandDialog open />)

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('overflow-hidden p-0')
    })

    it('applies custom className to DialogContent', () => {
      render(<CommandDialog open className="custom-dialog-class" />)

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveClass('overflow-hidden p-0 custom-dialog-class')
    })

    it('shows close button by default', () => {
      render(<CommandDialog open />)

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('data-show-close-button', 'true')
    })

    it('hides close button when showCloseButton is false', () => {
      render(<CommandDialog open showCloseButton={false} />)

      const content = screen.getByTestId('dialog-content')
      expect(content).toHaveAttribute('data-show-close-button', 'false')
    })

    it('renders Command with complex styling', () => {
      render(<CommandDialog open />)

      const command = screen.getByTestId('cmdk-command')
      expect(command).toHaveClass(
        '[&_[cmdk-group-heading]]:text-muted-foreground'
      )
    })

    it('renders children inside Command', () => {
      render(
        <CommandDialog open>
          <div data-testid="dialog-child">Dialog child content</div>
        </CommandDialog>
      )

      expect(screen.getByTestId('dialog-child')).toBeInTheDocument()
    })
  })

  describe('Dialog behavior', () => {
    it('handles open/close state', async () => {
      const onOpenChange = jest.fn()
      const { rerender } = render(
        <CommandDialog open={false} onOpenChange={onOpenChange} />
      )

      expect(screen.queryByTestId('dialog-content')).not.toBeInTheDocument()

      rerender(<CommandDialog open={true} onOpenChange={onOpenChange} />)

      expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    })

    it('forwards Dialog props correctly', () => {
      render(<CommandDialog open data-custom="dialog-prop" />)

      const dialogRoot = screen.getByTestId('dialog-root')
      expect(dialogRoot).toHaveAttribute('data-custom', 'dialog-prop')
    })
  })
})

describe('CommandInput component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandInput />)
      expect(screen.getByTestId('cmdk-input')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(<CommandInput placeholder="Search..." />)
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with wrapper div', () => {
      render(<CommandInput />)

      const wrapper = screen.getByTestId('cmdk-input').parentElement
      expect(wrapper).toHaveAttribute('data-slot', 'command-input-wrapper')
      expect(wrapper).toHaveClass('flex h-9 items-center gap-2 border-b px-3')
    })

    it('renders search icon', () => {
      render(<CommandInput />)
      expect(screen.getByTestId('search-icon')).toBeInTheDocument()
    })

    it('applies default className to input', () => {
      render(<CommandInput />)

      const input = screen.getByTestId('cmdk-input')
      expect(input).toHaveClass(
        'placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50'
      )
    })

    it('applies custom className', () => {
      render(<CommandInput className="custom-input-class" />)

      const input = screen.getByTestId('cmdk-input')
      expect(input).toHaveClass('custom-input-class')
    })

    it('forwards props to CMDK Input', () => {
      render(<CommandInput placeholder="Search commands..." />)

      const input = screen.getByTestId('cmdk-input')
      expect(input).toHaveAttribute('placeholder', 'Search commands...')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandInput />)

      const input = screen.getByTestId('cmdk-input')
      expect(input).toHaveAttribute('data-slot', 'command-input')
    })
  })

  describe('Interaction', () => {
    it('accepts user input', async () => {
      const user = userEvent.setup()
      render(<CommandInput />)

      const input = screen.getByTestId('cmdk-input')
      await user.type(input, 'test input')

      expect(input).toHaveValue('test input')
    })

    it('handles disabled state', () => {
      render(<CommandInput disabled />)

      const input = screen.getByTestId('cmdk-input')
      expect(input).toBeDisabled()
    })
  })
})

describe('CommandList component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandList />)
      expect(screen.getByTestId('cmdk-list')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(
        <CommandList>
          <div>List content</div>
        </CommandList>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with children', () => {
      render(
        <CommandList>
          <div data-testid="list-child">List item</div>
        </CommandList>
      )

      expect(screen.getByTestId('list-child')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<CommandList />)

      const list = screen.getByTestId('cmdk-list')
      expect(list).toHaveClass(
        'max-h-[300px] scroll-py-1 overflow-x-hidden overflow-y-auto'
      )
    })

    it('applies custom className', () => {
      render(<CommandList className="custom-list-class" />)

      const list = screen.getByTestId('cmdk-list')
      expect(list).toHaveClass('custom-list-class')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandList />)

      const list = screen.getByTestId('cmdk-list')
      expect(list).toHaveAttribute('data-slot', 'command-list')
    })
  })
})

describe('CommandEmpty component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandEmpty />)
      expect(screen.getByTestId('cmdk-empty')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(<CommandEmpty />)
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with default text', () => {
      render(<CommandEmpty />)

      const empty = screen.getByTestId('cmdk-empty')
      expect(empty).toHaveTextContent('No results found.')
    })

    it('renders with custom children', () => {
      render(<CommandEmpty>Custom empty message</CommandEmpty>)

      const empty = screen.getByTestId('cmdk-empty')
      expect(empty).toHaveTextContent('Custom empty message')
    })

    it('applies default className', () => {
      render(<CommandEmpty />)

      const empty = screen.getByTestId('cmdk-empty')
      expect(empty).toHaveClass('py-6 text-center text-sm')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandEmpty />)

      const empty = screen.getByTestId('cmdk-empty')
      expect(empty).toHaveAttribute('data-slot', 'command-empty')
    })
  })
})

describe('CommandGroup component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandGroup />)
      expect(screen.getByTestId('cmdk-group')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(
        <CommandGroup>
          <div>Group content</div>
        </CommandGroup>
      )
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with children', () => {
      render(
        <CommandGroup>
          <div data-testid="group-child">Group item</div>
        </CommandGroup>
      )

      expect(screen.getByTestId('group-child')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<CommandGroup />)

      const group = screen.getByTestId('cmdk-group')
      expect(group).toHaveClass(
        'text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium'
      )
    })

    it('applies custom className', () => {
      render(<CommandGroup className="custom-group-class" />)

      const group = screen.getByTestId('cmdk-group')
      expect(group).toHaveClass('custom-group-class')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandGroup />)

      const group = screen.getByTestId('cmdk-group')
      expect(group).toHaveAttribute('data-slot', 'command-group')
    })
  })
})

describe('CommandSeparator component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandSeparator />)
      expect(screen.getByTestId('cmdk-separator')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(<CommandSeparator />)
      expect(asFragment()).toMatchSnapshot()
    })

    it('applies default className', () => {
      render(<CommandSeparator />)

      const separator = screen.getByTestId('cmdk-separator')
      expect(separator).toHaveClass('bg-border -mx-1 h-px')
    })

    it('applies custom className', () => {
      render(<CommandSeparator className="custom-separator-class" />)

      const separator = screen.getByTestId('cmdk-separator')
      expect(separator).toHaveClass('custom-separator-class')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandSeparator />)

      const separator = screen.getByTestId('cmdk-separator')
      expect(separator).toHaveAttribute('data-slot', 'command-separator')
    })
  })
})

describe('CommandItem component', () => {
  describe('Rendering', () => {
    it('renders without crashing', () => {
      render(<CommandItem />)
      expect(screen.getByTestId('cmdk-item')).toBeInTheDocument()
    })

    it('matches the snapshot', () => {
      const { asFragment } = render(<CommandItem>Item content</CommandItem>)
      expect(asFragment()).toMatchSnapshot()
    })

    it('renders with children', () => {
      render(
        <CommandItem>
          <span data-testid="item-child">Item text</span>
        </CommandItem>
      )

      expect(screen.getByTestId('item-child')).toBeInTheDocument()
    })

    it('applies default className', () => {
      render(<CommandItem />)

      const item = screen.getByTestId('cmdk-item')
      expect(item).toHaveClass(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
      )
    })

    it('applies custom className', () => {
      render(<CommandItem className="custom-item-class" />)

      const item = screen.getByTestId('cmdk-item')
      expect(item).toHaveClass('custom-item-class')
    })

    it('has correct role attribute', () => {
      render(<CommandItem />)

      const item = screen.getByTestId('cmdk-item')
      expect(item).toHaveAttribute('role', 'option')
    })

    it('has correct data-slot attribute', () => {
      render(<CommandItem />)

      const item = screen.getByTestId('cmdk-item')
      expect(item).toHaveAttribute('data-slot', 'command-item')
    })
  })

  describe('Interaction', () => {
    it('handles click events', async () => {
      const handleClick = jest.fn()
      render(<CommandItem onClick={handleClick}>Clickable item</CommandItem>)

      const item = screen.getByTestId('cmdk-item')
      fireEvent.click(item)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })
})

describe('CommandShortcut component', () => {
  describe('CommandShortcut component', () => {
    describe('Rendering', () => {
      it('renders without crashing', () => {
        render(<CommandShortcut data-testid="shortcut-test" />)
        expect(screen.getByTestId('shortcut-test')).toBeInTheDocument()
      })

      it('matches the snapshot', () => {
        const { asFragment } = render(<CommandShortcut>⌘K</CommandShortcut>)
        expect(asFragment()).toMatchSnapshot()
      })

      it('renders with children', () => {
        render(<CommandShortcut>⌘K</CommandShortcut>)

        const shortcut = screen.getByText('⌘K')
        expect(shortcut).toHaveTextContent('⌘K')
      })

      it('applies default className', () => {
        render(<CommandShortcut data-testid="shortcut-test" />)

        const shortcut = screen.getByTestId('shortcut-test')
        expect(shortcut).toHaveClass(
          'text-muted-foreground ml-auto text-xs tracking-widest'
        )
      })

      it('applies custom className', () => {
        render(
          <CommandShortcut
            className="custom-shortcut-class"
            data-testid="shortcut-test"
          />
        )

        const shortcut = screen.getByTestId('shortcut-test')
        expect(shortcut).toHaveClass('custom-shortcut-class')
      })

      it('has correct data-slot attribute', () => {
        render(<CommandShortcut data-testid="shortcut-test" />)

        const shortcut = screen.getByTestId('shortcut-test')
        expect(shortcut).toHaveAttribute('data-slot', 'command-shortcut')
      })

      it('is a span element', () => {
        render(<CommandShortcut data-testid="shortcut-test" />)

        const shortcut = screen.getByTestId('shortcut-test')
        expect(shortcut.tagName).toBe('SPAN')
      })
    })
  })
})

describe('Command component integration', () => {
  it('renders complete command palette structure', () => {
    render(
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <span>Calendar</span>
              <CommandShortcut>⌘K</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <span>Search Emoji</span>
              <CommandShortcut>⌘J</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <span>Profile</span>
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    )

    expect(screen.getByTestId('cmdk-command')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-input')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-list')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-empty')).toBeInTheDocument()
    expect(screen.getAllByTestId('cmdk-group')).toHaveLength(2)
    expect(screen.getAllByTestId('cmdk-item')).toHaveLength(3)
    expect(screen.getByTestId('cmdk-separator')).toBeInTheDocument()
    expect(screen.getAllByText(/⌘[KJP]/)).toHaveLength(3)
  })

  it('renders CommandDialog with complete structure', () => {
    render(
      <CommandDialog open>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick Actions">
            <CommandItem>
              <span>New File</span>
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    )

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-command')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-input')).toBeInTheDocument()
    expect(screen.getByTestId('cmdk-list')).toBeInTheDocument()
  })

  it('handles complex nested structure', () => {
    render(
      <Command>
        <CommandInput />
        <CommandList>
          {Array.from({ length: 5 }, (_, i) => (
            <CommandGroup key={i} heading={`Group ${i + 1}`}>
              {Array.from({ length: 3 }, (_, j) => (
                <CommandItem key={j}>
                  Item {i + 1}.{j + 1}
                  <CommandShortcut>
                    ⌘{i + 1}
                    {j + 1}
                  </CommandShortcut>
                </CommandItem>
              ))}
              {i < 4 && <CommandSeparator />}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    )

    expect(screen.getAllByTestId('cmdk-group')).toHaveLength(5)
    expect(screen.getAllByTestId('cmdk-item')).toHaveLength(15)
    expect(screen.getAllByText(/⌘\d+\d+/)).toHaveLength(15)
    expect(screen.getAllByTestId('cmdk-separator')).toHaveLength(4)
  })
})

describe('Component accessibility', () => {
  it('CommandItem has proper role for screen readers', () => {
    render(<CommandItem>Accessible item</CommandItem>)

    const item = screen.getByRole('option')
    expect(item).toBeInTheDocument()
  })

  it('CommandInput is focusable', () => {
    render(<CommandInput />)

    const input = screen.getByTestId('cmdk-input')
    input.focus()
    expect(input).toHaveFocus()
  })

  it('maintains proper heading structure in CommandDialog', () => {
    render(<CommandDialog open title="Test Dialog" />)

    const title = screen.getByTestId('dialog-title')
    expect(title.tagName).toBe('H2')
  })
})

describe('Component edge cases', () => {
  it('handles empty children gracefully', () => {
    render(
      <Command>
        <CommandList>
          <CommandGroup />
          <CommandItem />
        </CommandList>
      </Command>
    )

    expect(screen.getByTestId('cmdk-command')).toBeInTheDocument()
  })

  it('handles null className gracefully', () => {
    render(<Command className={null as any} />)

    const command = screen.getByTestId('cmdk-command')
    expect(command).toBeInTheDocument()
  })

  it('handles undefined props gracefully', () => {
    render(
      <CommandDialog
        open
        title={undefined}
        description={undefined}
        showCloseButton={undefined}
      />
    )

    expect(screen.getByTestId('dialog-content')).toBeInTheDocument()
  })
})
