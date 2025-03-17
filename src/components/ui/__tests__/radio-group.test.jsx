import '@testing-library/jest-dom'
import { fireEvent, render } from '@testing-library/react'
import React from 'react'
import { RadioGroup, RadioGroupItem } from '../radio-group'

// filepath: /SOGo/src/components/ui/radio-group.test.tsx

describe('RadioGroupItem component', () => {
  it('matches the snapshot', () => {
    const { asFragment } = render(
      <RadioGroup>
        <RadioGroupItem />
      </RadioGroup>
    )
    expect(asFragment()).toMatchSnapshot()
  })
  it('renders RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem />
      </RadioGroup>
    )
    expect(container.firstChild).toHaveClass('grid gap-2')
  })

  it('applies custom className to RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem className="custom-class" />
      </RadioGroup>
    )
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('renders Circle icon inside RadioGroupItem component', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem />
      </RadioGroup>
    )
    expect(container.querySelector('svg')).toHaveClass(
      'h-3.5 w-3.5 fill-primary'
    )
  })

  it('renders RadioGroupItem component with additional props', () => {
    const { container } = render(
      <RadioGroup>
        <RadioGroupItem data-testid="radio-group-item" />
      </RadioGroup>
    )
    expect(
      container.querySelector('[data-testid="radio-group-item"]')
    ).toBeInTheDocument()
  })

  it('renders RadioGroupItem component with ref', () => {
    const ref = React.createRef()
    render(
      <RadioGroup>
        <RadioGroupItem ref={ref} />
      </RadioGroup>
    )
    expect(ref.current).toBeInstanceOf(HTMLButtonElement)
  })

  it('toggles RadioGroupItem state on click', () => {
    const { getByRole } = render(
      <RadioGroup>
        <RadioGroupItem />
      </RadioGroup>
    )
    const radioItem = getByRole('radio')
    fireEvent.click(radioItem)
    expect(radioItem).toBeChecked()
  })

  it('renders RadioGroupItem component with disabled state', () => {
    const { getByRole } = render(
      <RadioGroup>
        <RadioGroupItem disabled />
      </RadioGroup>
    )
    const radioItem = getByRole('radio')
    expect(radioItem).toBeDisabled()
  })
})
