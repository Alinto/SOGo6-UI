import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { RadioGroup, RadioGroupItem } from '../radio-group'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Circle: ({ className, ...props }: any) => (
    <svg {...props} className={className} data-testid="circle-icon">
      <circle />
    </svg>
  ),
}))

// Mock Radix UI components
jest.mock('@radix-ui/react-radio-group', () => ({
  Root: React.forwardRef<any, any>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={className} role="radiogroup" {...props}>
      {children}
    </div>
  )),
  Item: React.forwardRef<any, any>(
    ({ className, children, onClick, ...props }, ref) => {
      const [checked, setChecked] = React.useState(false)
      return (
        <button
          ref={ref}
          className={className}
          role="radio"
          type="button"
          aria-checked={checked}
          onClick={(e) => {
            setChecked(!checked)
            if (onClick) onClick(e)
          }}
          {...props}
        >
          {children}
        </button>
      )
    }
  ),
  Indicator: ({ children, className }: any) => (
    <span className={className}>{children}</span>
  ),
}))

// Mock cn utility
jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

// filepath: /SOGo/src/components/ui/radio-group.test.tsx

describe('RadioGroupItem component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    )
    expect(asFragment()).toMatchSnapshot()
  })

  it('renders RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    )
    expect(container.firstChild).toHaveClass('grid gap-2')
  })

  it('applies custom className to RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="test" className="custom-class" />
      </RadioGroup>
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders Circle icon inside RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    )
    expect(
      container.querySelector('[data-testid="circle-icon"]')
    ).toBeInTheDocument()
    expect(container.querySelector('[data-testid="circle-icon"]')).toHaveClass(
      'fill-primary h-3.5 w-3.5'
    )
  })

  it('renders RadioGroupItem component with additional props', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem value="test" data-testid="radio-group-item" />
      </RadioGroup>
    )
    expect(
      container.querySelector('[data-testid="radio-group-item"]')
    ).toBeInTheDocument()
  })

  it('renders RadioGroupItem component with ref', () => {
    const ref = React.createRef<HTMLButtonElement>()
    render(
      <RadioGroup>
        <RadioGroupItem value="test" ref={ref} />
      </RadioGroup>
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('toggles RadioGroupItem state on click', () => {
    const { getByRole } = render(
      <RadioGroup>
        <RadioGroupItem value="test" />
      </RadioGroup>
    )
    const radioItem = getByRole('radio')
    fireEvent.click(radioItem)
    expect(radioItem).toBeChecked()
  })

  it('renders RadioGroupItem component with disabled state', () => {
    const { getByRole } = render(
      <RadioGroup>
        <RadioGroupItem value="test" disabled />
      </RadioGroup>
    )
    const radioItem = getByRole('radio')
    expect(radioItem).toBeDisabled()
  })
})
