import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
} from '../dialog'

describe('DialogOverlay Component', () => {
  it('renders the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByRole('dialog').parentElement
    expect(overlay).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    expect(asFragment()).toMatchSnapshot()
  })

  it('applies custom className to DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay className="custom-class" />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByText('Dialog Content').previousElementSibling
    expect(overlay).toHaveClass('custom-class')
  })

  it('forwards additional props to the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogTitle>Test Dialog</DialogTitle>
          <DialogOverlay data-testid="dialog-overlay" />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByTestId('dialog-overlay')
    expect(overlay).toBeInTheDocument()
  })
})
