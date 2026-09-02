import { render } from '@testing-library/react'
import { useTheme } from 'next-themes'
import { Toaster as SonnerToaster } from 'sonner'
import { Toaster } from '../sonner'

jest.mock('next-themes', () => ({
  useTheme: jest.fn(),
}))

jest.mock('sonner', () => ({
  Toaster: jest.fn(() => <div data-testid="sonner-toaster-component" />),
}))

describe('Toaster (sonner UI component)', () => {
  let mockUseTheme: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseTheme = useTheme as jest.Mock
    mockUseTheme.mockReturnValue({ theme: 'light' })
  })

  it('renders without crashing', () => {
    const { container } = render(<Toaster />)
    expect(container).toBeTruthy()
  })

  it('renders Sonner component', () => {
    const { getByTestId } = render(<Toaster />)
    expect(getByTestId('sonner-toaster-component')).toBeInTheDocument()
  })

  it('gets theme from useTheme hook', () => {
    render(<Toaster />)
    expect(mockUseTheme).toHaveBeenCalled()
  })

  it('uses system theme as default', () => {
    mockUseTheme.mockReturnValue({ theme: undefined })
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.theme).toBe('system')
  })

  it('passes theme from hook to Sonner', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' })
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.theme).toBe('dark')
  })

  it('maps accessibility themes to light for Sonner', () => {
    mockUseTheme.mockReturnValue({ theme: 'dyslexia' })
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.theme).toBe('light')
  })

  it('sets correct className', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.className).toBe('toaster group')
  })

  it('configures toast styling', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.toastOptions).toBeDefined()
    expect(callArgs.toastOptions.classNames).toBeDefined()
  })

  it('applies correct toast classes', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    const classNames = callArgs.toastOptions.classNames

    expect(classNames.toast).toContain('group')
    expect(classNames.toast).toContain('toast')
    expect(classNames.toast).toContain('group-[.toaster]:bg-background')
    expect(classNames.toast).toContain('group-[.toaster]:text-foreground')
  })

  it('applies description styles', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    const classNames = callArgs.toastOptions.classNames

    expect(classNames.description).toBe('group-[.toast]:text-muted-foreground')
  })

  it('applies action button styles', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    const classNames = callArgs.toastOptions.classNames

    expect(classNames.actionButton).toContain('group-[.toast]:bg-primary')
    expect(classNames.actionButton).toContain(
      'group-[.toast]:text-primary-foreground'
    )
  })

  it('applies cancel button styles', () => {
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    const classNames = callArgs.toastOptions.classNames

    expect(classNames.cancelButton).toContain('group-[.toast]:bg-muted')
    expect(classNames.cancelButton).toContain(
      'group-[.toast]:text-muted-foreground'
    )
  })

  it('spreads additional props to Sonner', () => {
    const customProps = { position: 'bottom-right' as const }
    render(<Toaster {...customProps} />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.position).toBe('bottom-right')
  })

  it('switches theme dynamically', () => {
    const { rerender } = render(<Toaster />)

    mockUseTheme.mockReturnValue({ theme: 'dark' })
    rerender(<Toaster />)

    const calls = (SonnerToaster as unknown as jest.Mock).mock.calls
    const lastCallArgs = calls[calls.length - 1][0]
    expect(lastCallArgs.theme).toBe('dark')
  })

  it('handles light theme', () => {
    mockUseTheme.mockReturnValue({ theme: 'light' })
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.theme).toBe('light')
  })

  it('combines theme and classNames correctly', () => {
    mockUseTheme.mockReturnValue({ theme: 'dark' })
    render(<Toaster />)

    const callArgs = (SonnerToaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs).toEqual(
      expect.objectContaining({
        theme: 'dark',
        className: 'toaster group',
        toastOptions: expect.any(Object),
      })
    )
  })

  it('exports Toaster component', () => {
    expect(Toaster).toBeDefined()
    expect(typeof Toaster).toBe('function')
  })
})
