import { render } from '@testing-library/react'
import { Toaster } from 'sonner'
import { NotificationToaster } from '../notification-toaster'

jest.mock('sonner', () => ({
  Toaster: jest.fn(() => <div data-testid="sonner-toaster" />),
}))

describe('NotificationToaster', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { container } = render(<NotificationToaster />)
    expect(container).toBeTruthy()
  })

  it('renders Toaster component', () => {
    const { getByTestId } = render(<NotificationToaster />)
    expect(getByTestId('sonner-toaster')).toBeInTheDocument()
  })

  it('passes correct props to Toaster', () => {
    render(<NotificationToaster />)

    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs).toMatchObject({
      position: 'top-right',
      richColors: true,
      closeButton: true,
      expand: true,
      duration: 5000,
    })
  })

  it('sets position to top-right', () => {
    render(<NotificationToaster />)
    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.position).toBe('top-right')
  })

  it('enables richColors', () => {
    render(<NotificationToaster />)
    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.richColors).toBe(true)
  })

  it('shows close button', () => {
    render(<NotificationToaster />)
    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.closeButton).toBe(true)
  })

  it('expands toasts', () => {
    render(<NotificationToaster />)
    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.expand).toBe(true)
  })

  it('sets default duration to 5000ms', () => {
    render(<NotificationToaster />)
    const callArgs = (Toaster as unknown as jest.Mock).mock.calls[0][0]
    expect(callArgs.duration).toBe(5000)
  })
})
