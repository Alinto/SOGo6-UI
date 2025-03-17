import '@/__mocks__/matchMedia.mock'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
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

    expect(screen.getByText('Header')).toBeInTheDocument()
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
          <SidebarSeparator>Separator</SidebarSeparator>
        </Sidebar>
      </SidebarProvider>
    )

    expect(screen.getByText('Separator')).toBeInTheDocument()
  })
})
