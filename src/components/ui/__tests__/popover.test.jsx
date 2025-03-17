import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from '../popover'

// filepath: src/components/ui/popover.test.tsx

describe('Popover Component', () => {
  it('renders PopoverTrigger and PopoverContent', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Open Popover')).toBeInTheDocument()
    fireEvent.click(screen.getByText('Open Popover'))
    expect(screen.getByText('Popover Content')).toBeInTheDocument()
  })

  it('matches snapshot', () => {
    const { asFragment } = render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders PopoverAnchor', () => {
    render(
      <Popover>
        <PopoverAnchor>Anchor</PopoverAnchor>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>
    )

    expect(screen.getByText('Anchor')).toBeInTheDocument()
  })

  it('applies custom className to PopoverContent', () => {
    render(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent className="custom-class">
          Popover Content
        </PopoverContent>
      </Popover>
    )

    fireEvent.click(screen.getByText('Open Popover'))
    expect(screen.getByText('Popover Content')).toHaveClass('custom-class')
  })
})
