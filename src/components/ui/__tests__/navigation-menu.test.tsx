import { render, screen } from '@testing-library/react'

import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../navigation-menu'

describe('NavigationMenu', () => {
  describe('NavigationMenu', () => {
    it('should render the root element', () => {
      render(
        <NavigationMenu>
          <div>Test content</div>
        </NavigationMenu>
      )

      const navigationMenu = screen.getByRole('navigation')
      expect(navigationMenu).toBeInTheDocument()
      expect(navigationMenu).toHaveAttribute('data-slot', 'navigation-menu')
    })

    it('should render with custom className', () => {
      render(
        <NavigationMenu className="custom-class">
          <div>Test content</div>
        </NavigationMenu>
      )

      const navigationMenu = screen.getByRole('navigation')
      expect(navigationMenu).toHaveClass('custom-class')
    })

    it('should render viewport by default', () => {
      render(
        <NavigationMenu>
          <div>Test content</div>
        </NavigationMenu>
      )

      const navigationMenu = screen.getByRole('navigation')
      expect(navigationMenu).toHaveAttribute('data-viewport', 'true')
    })

    it('should not render viewport when viewport prop is false', () => {
      render(
        <NavigationMenu viewport={false}>
          <div>Test content</div>
        </NavigationMenu>
      )

      const navigationMenu = screen.getByRole('navigation')
      expect(navigationMenu).toHaveAttribute('data-viewport', 'false')
    })

    it('should pass through additional props', () => {
      render(
        <NavigationMenu data-testid="custom-nav-menu">
          <div>Test content</div>
        </NavigationMenu>
      )

      expect(screen.getByTestId('custom-nav-menu')).toBeInTheDocument()
    })
  })

  describe('NavigationMenuList', () => {
    it('should render the list element', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <div>List item</div>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const list = screen
        .getByRole('navigation')
        .querySelector('[data-slot="navigation-menu-list"]')
      expect(list).toBeInTheDocument()
      expect(list).toHaveClass('flex', 'flex-1', 'list-none')
    })

    it('should apply custom className to list', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList className="custom-list-class">
            <div>List item</div>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const list = screen
        .getByRole('navigation')
        .querySelector('[data-slot="navigation-menu-list"]')
      expect(list).toHaveClass('custom-list-class')
    })
  })

  describe('NavigationMenuItem', () => {
    it('should render the menu item element', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <div>Item content</div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const menuItem = screen
        .getByRole('navigation')
        .querySelector('[data-slot="navigation-menu-item"]')
      expect(menuItem).toBeInTheDocument()
      expect(menuItem).toHaveClass('relative')
    })

    it('should apply custom className to menu item', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem className="custom-item-class">
              <div>Item content</div>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const menuItem = screen
        .getByRole('navigation')
        .querySelector('[data-slot="navigation-menu-item"]')
      expect(menuItem).toHaveClass('custom-item-class')
    })
  })

  describe('NavigationMenuTrigger', () => {
    it('should render the trigger button', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByRole('button', { name: /trigger/i })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveAttribute('data-slot', 'navigation-menu-trigger')
    })

    it('should have trigger styles applied', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Trigger</NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByRole('button', { name: /trigger/i })
      expect(trigger).toHaveClass('inline-flex', 'h-9', 'w-max')
    })

    it('should apply custom className to trigger', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger className="custom-trigger-class">
                Trigger
              </NavigationMenuTrigger>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const trigger = screen.getByRole('button', { name: /trigger/i })
      expect(trigger).toHaveClass('custom-trigger-class')
    })
  })

  describe('NavigationMenuLink', () => {
    it('should render the link element', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#test">Link</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const link = screen.getByRole('link', { name: /link/i })
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('data-slot', 'navigation-menu-link')
    })

    it('should have link styles applied', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#test">Link</NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const link = screen.getByRole('link', { name: /link/i })
      expect(link).toHaveClass('flex', 'flex-col', 'gap-1', 'rounded-sm', 'p-2')
    })

    it('should apply custom className to link', () => {
      render(
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink href="#test" className="custom-link-class">
                Link
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      )

      const link = screen.getByRole('link', { name: /link/i })
      expect(link).toHaveClass('custom-link-class')
    })
  })

  describe('navigationMenuTriggerStyle', () => {
    it('should return trigger style classes', () => {
      const styles = navigationMenuTriggerStyle()
      expect(styles).toContain('inline-flex')
      expect(styles).toContain('h-9')
      expect(styles).toContain('w-max')
      expect(styles).toContain('items-center')
      expect(styles).toContain('justify-center')
      expect(styles).toContain('rounded-md')
    })

    it('should accept variant options', () => {
      const styles = navigationMenuTriggerStyle()
      expect(styles).toBeTruthy()
      expect(typeof styles).toBe('string')
    })
  })
})
