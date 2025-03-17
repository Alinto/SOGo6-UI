import FixedButton from '@/components/ui/buttons/fixed-button'
import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'

// filepath: src/components/ui/buttons/fixed-button.test.tsx

describe('FixedButton Component', () => {
  it('renders the FixedButton with children', () => {
    render(<FixedButton>Click Me</FixedButton>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
  it('matches the snapshot', () => {
    const { asFragment } = render(<FixedButton>Click Me</FixedButton>)
    expect(asFragment()).toMatchSnapshot()
  })

  it('applies the fixed position classes', () => {
    render(<FixedButton>Click Me</FixedButton>)
    const button = screen.getByText('Click Me')
    expect(button).toHaveClass(
      'fixed bottom-20 right-12 p-3 rounded-full shadow-lg focus:outline-none focus:ring-2'
    )
  })

  it('applies additional className', () => {
    render(<FixedButton className="custom-class">Click Me</FixedButton>)
    const button = screen.getByText('Click Me')
    expect(button).toHaveClass('custom-class')
  })

  it('forwards additional props to the button element', () => {
    render(<FixedButton data-testid="fixed-button">Click Me</FixedButton>)
    const button = screen.getByTestId('fixed-button')
    expect(button).toBeInTheDocument()
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<FixedButton onClick={handleClick}>Click Me</FixedButton>)
    const button = screen.getByText('Click Me')
    fireEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
