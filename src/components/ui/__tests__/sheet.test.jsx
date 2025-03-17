import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  // filepath: src/components/ui/sheet.test.tsx
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../sheet'

describe('Sheet Component', () => {
  it('renders SheetTrigger and opens SheetContent on click', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button>Footer Button</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )

    expect(screen.getByText('Open Sheet')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Open Sheet'))
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet Description')).toBeInTheDocument()
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button>Footer Button</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders SheetHeader, SheetFooter, SheetTitle, and SheetDescription', () => {
    render(
      <Sheet>
        <SheetTrigger>Open Sheet</SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Sheet Title</SheetTitle>
            <SheetDescription>Sheet Description</SheetDescription>
          </SheetHeader>
          <SheetFooter>
            <button>Footer Button</button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    )

    fireEvent.click(screen.getByText('Open Sheet'))
    expect(screen.getByText('Sheet Title')).toBeInTheDocument()
    expect(screen.getByText('Sheet Description')).toBeInTheDocument()
    expect(screen.getByText('Footer Button')).toBeInTheDocument()
  })
})
