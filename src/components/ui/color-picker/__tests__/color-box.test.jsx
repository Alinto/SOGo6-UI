import ColorBox from '@/components/ui/color-picker/color-box'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'

// filepath: src/components/ui/color-picker/color-box.test.tsx

describe('ColorBox Component', () => {
  it('renders the ColorBox with children', () => {
    render(<ColorBox>Content</ColorBox>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })
  it('matches the snapshot', () => {
    const { asFragment } = render(<ColorBox>Content</ColorBox>)
    expect(asFragment()).toMatchSnapshot()
  })
  it('applies the correct classes to the outer div', () => {
    render(<ColorBox>Content</ColorBox>)
    const outerDiv = screen.getByTestId('color-box')
    expect(outerDiv).toHaveClass(
      'z-50',
      'rounded-xl',
      'w-80',
      'h-96',
      'bg-popover',
      'border-border',
      'text-popover-foreground'
    )
  })

  it('renders the inner div with the correct classes', () => {
    render(<ColorBox>Content</ColorBox>)
    const innerDiv = screen.getByTestId('color-box-triangle')
    expect(innerDiv).toHaveClass(
      'absolute',
      'top-0',
      '-translate-y-1.5',
      'left-1/2',
      '-translate-x-1/2',
      'border-b-[8px]',
      'border-b-popover',
      'w-0',
      'h-0'
    )
  })

  it('renders children correctly', () => {
    render(
      <ColorBox>
        <span>Child Element</span>
      </ColorBox>
    )
    expect(screen.getByText('Child Element')).toBeInTheDocument()
  })
})
