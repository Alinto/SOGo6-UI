/* eslint-disable react/jsx-no-literals */
import { Button } from '@/components/ui/button'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

describe('Button component', () => {
  it('renders with default props', () => {
    render(<Button>Default Button</Button>)
    const button = screen.getByRole('button', { name: /default button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-primary text-primary-foreground')
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(<Button />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders with destructive variant', () => {
    render(<Button variant="destructive">Destructive Button</Button>)
    const button = screen.getByRole('button', { name: /destructive button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-destructive text-destructive-foreground')
  })

  it('renders with outline variant', () => {
    render(<Button variant="outline">Outline Button</Button>)
    const button = screen.getByRole('button', { name: /outline button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('border border-input bg-background')
  })

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>)
    const button = screen.getByRole('button', { name: /secondary button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('bg-secondary text-secondary-foreground')
  })

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>)
    const button = screen.getByRole('button', { name: /ghost button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('hover:bg-accent hover:text-accent-foreground')
  })

  it('renders with link variant', () => {
    render(<Button variant="link">Link Button</Button>)
    const button = screen.getByRole('button', { name: /link button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass(
      'text-primary underline-offset-4 hover:underline'
    )
  })

  it('renders with small size', () => {
    render(<Button size="sm">Small Button</Button>)
    const button = screen.getByRole('button', { name: /small button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-9 rounded-md px-3')
  })

  it('renders with large size', () => {
    render(<Button size="lg">Large Button</Button>)
    const button = screen.getByRole('button', { name: /large button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-11 rounded-md px-8')
  })

  it('renders with icon size', () => {
    render(<Button size="icon">Icon Button</Button>)
    const button = screen.getByRole('button', { name: /icon button/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveClass('h-9 w-9')
  })

  it('renders as a child component', () => {
    render(
      <Button asChild>
        <span>Child Button</span>
      </Button>
    )
    const button = screen.getByText(/child button/i)
    expect(button).toBeInTheDocument()
  })

  it('renders as disabled', () => {
    render(<Button disabled>Disabled Button</Button>)
    const button = screen.getByRole('button', { name: /disabled button/i })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('renders as a different component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Click me</a>
      </Button>
    )
    const linkElement = screen.getByRole('link')
    const button = screen.queryByRole('button')
    expect(button).not.toBeInTheDocument()
    expect(linkElement).toBeInTheDocument()
    expect(linkElement.tagName).toBe('A')
    expect(linkElement).toHaveAttribute('href', '/test')
  })
  it('renders button component when asChild is false', () => {
    render(
      <Button asChild={false}>
        <a href="/test">Click me</a>
      </Button>
    )
    const linkElement = screen.getByRole('link')
    const button = screen.queryByRole('button')
    expect(button).toBeInTheDocument()
    expect(linkElement).toBeInTheDocument()
    expect(linkElement.tagName).toBe('A')
    expect(linkElement).toHaveAttribute('href', '/test')
  })
})
