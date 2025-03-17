import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import { Dialog, DialogContent, DialogOverlay, DialogTrigger } from '../dialog'

describe('DialogOverlay Component', () => {
  it('renders the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
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
          <DialogOverlay className="custom-class" />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByRole('dialog').parentElement
    expect(overlay).toHaveClass('custom-class')
  })

  it('forwards additional props to the DialogOverlay', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
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

  it('renders the DialogOverlay with animation classes when open and closed', () => {
    render(
      <Dialog>
        <DialogTrigger>Open Dialog</DialogTrigger>
        <DialogContent>
          <DialogOverlay />
          <div>Dialog Content</div>
        </DialogContent>
      </Dialog>
    )

    // Open the dialog
    fireEvent.click(screen.getByText('Open Dialog'))

    const overlay = screen.getByRole('dialog').parentElement
    expect(overlay).toHaveClass(
      'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0'
    )
  })
})
