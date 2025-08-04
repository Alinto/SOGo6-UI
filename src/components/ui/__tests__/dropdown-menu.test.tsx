import {
  // filepath: /SOGo/src/components/ui/dropdown-menu.test.tsx
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

describe('DropdownMenu component', () => {
  it('renders DropdownMenuTrigger correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    const triggerElement = screen.getByText('Open Menu')
    expect(triggerElement).toBeInTheDocument()
  })

  it('renders DropdownMenuItem correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const menuItem = screen.getByText('Item 1')
    expect(menuItem).toBeInTheDocument()
  })

  it('renders DropdownMenuCheckboxItem correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const checkboxItem = screen.getByText('Checkbox Item')
    expect(checkboxItem).toBeInTheDocument()
  })

  it('renders DropdownMenuRadioItem correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem>Radio Item</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const radioItem = screen.getByText('Radio Item')
    expect(radioItem).toBeInTheDocument()
  })

  it('renders DropdownMenuLabel correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const label = screen.getByText('Label')
    expect(label).toBeInTheDocument()
  })

  it('renders DropdownMenuSeparator correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const separator = screen.getByRole('separator')
    expect(separator).toBeInTheDocument()
  })

  it('renders DropdownMenuShortcut correctly', async () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item 1<DropdownMenuShortcut>Ctrl+S</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    const shortcut = screen.getByText('Ctrl+S')
    expect(shortcut).toBeInTheDocument()
  })

  it('renders DropdownMenuSub and DropdownMenuSubContent correctly', () => {
    render(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Sub Menu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    )
    /* WORKAROUND TO OPEN DROPDOWN */
    fireEvent.keyDown(screen.getByRole('button'), {
      key: 'ArrowDown',
      code: 'ArrowDown',
    })
    fireEvent.click(screen.getByText('Sub Menu'))
    const subItem = screen.getByText('Sub Item 1')
    expect(subItem).toBeInTheDocument()
  })
})
