import { Label } from '@/components/ui/label'
import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import React from 'react'

// filepath: /SOGo/src/components/ui/label.test.tsx

describe('Label component', () => {
  it('renders without crashing', () => {
    render(<Label>Test Label</Label>)
    const labelElement = screen.getByText('Test Label')
    expect(labelElement).toBeInTheDocument()
  })

  it('matches the snapshot', () => {
    const { asFragment } = render(<Label />)
    expect(asFragment()).toMatchSnapshot()
  })

  it('applies additional class names', () => {
    render(<Label className="extra-class">Test Label</Label>)
    const labelElement = screen.getByText('Test Label')
    expect(labelElement).toHaveClass('extra-class')
  })

  it('forwards ref to the label element', () => {
    const ref = React.createRef<HTMLLabelElement>()
    render(<Label ref={ref}>Test Label</Label>)
    expect(ref.current).toBeInstanceOf(HTMLLabelElement)
  })

  it('applies variant styles correctly', () => {
    render(
      <Label className="text-sm leading-none font-medium">Test Label</Label>
    )
    const labelElement = screen.getByText('Test Label')
    expect(labelElement).toHaveClass('text-sm font-medium leading-none')
  })

  it('disables the label when peer-disabled class is applied', () => {
    render(
      <Label className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        Test Label
      </Label>
    )
    const labelElement = screen.getByText('Test Label')
    expect(labelElement).toHaveClass(
      'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
    )
  })
})
