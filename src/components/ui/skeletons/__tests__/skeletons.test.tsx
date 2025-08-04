import '@testing-library/jest-dom'
import { render } from '@testing-library/react'

import {
  ButtonSkeleton,
  FixedButtonGroupSkeleton,
} from '@/components/ui/skeletons/buttons'
import InputSkeleton from '@/components/ui/skeletons/inputs'

describe('ButtonSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<ButtonSkeleton size="default" />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies correct classes for default size', () => {
    const { container } = render(<ButtonSkeleton size="default" />)
    expect(container.firstChild).toHaveClass('h-10 w-20 px-4 py-2')
  })

  it('applies correct classes for sm size', () => {
    const { container } = render(<ButtonSkeleton size="sm" />)
    expect(container.firstChild).toHaveClass('h-9 rounded-md px-3')
  })

  it('applies correct classes for lg size', () => {
    const { container } = render(<ButtonSkeleton size="lg" />)
    expect(container.firstChild).toHaveClass('h-11 rounded-md px-8')
  })

  it('applies correct classes for icon size', () => {
    const { container } = render(<ButtonSkeleton size="icon" />)
    expect(container.firstChild).toHaveClass('h-9 w-9')
  })

  it('applies additional classes', () => {
    const { container } = render(
      <ButtonSkeleton size="default" className="test-class" />
    )
    expect(container.firstChild).toHaveClass('test-class')
  })
})

describe('FixedButtonGroupSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<FixedButtonGroupSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders two button skeletons', () => {
    const { container } = render(<FixedButtonGroupSkeleton />)
    const buttons = container.querySelectorAll('.rounded-full')
    expect(buttons).toHaveLength(2)
  })

  it('applies correct container classes', () => {
    const { container } = render(<FixedButtonGroupSkeleton />)
    expect(container.firstChild).toHaveClass(
      'fixed right-12 bottom-20 flex justify-end gap-4 pt-6'
    )
  })

  it('renders buttons with shadow-lg class', () => {
    const { container } = render(<FixedButtonGroupSkeleton />)
    const buttons = container.querySelectorAll('.shadow-lg')
    expect(buttons).toHaveLength(2)
  })
})

describe('InputSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<InputSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('applies correct classes', () => {
    const { container } = render(<InputSkeleton />)
    expect(container.firstChild).toHaveClass(
      'border-input flex h-9 w-full rounded-md border px-3 py-1 shadow-xs'
    )
  })
})
