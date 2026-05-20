import { render, screen } from '@testing-library/react'
import {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
} from '../button-group'

// Mock dependencies
jest.mock('@/lib/utils', () => ({
  cn: (...args: any[]) => args.filter(Boolean).join(' '),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: ({ className, orientation, ...props }: any) => (
    <div
      data-testid="separator"
      data-orientation={orientation}
      className={className}
      {...props}
    />
  ),
}))

jest.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}))

describe('ButtonGroup', () => {
  describe('ButtonGroup component', () => {
    it('renders with role="group"', () => {
      render(<ButtonGroup>content</ButtonGroup>)
      expect(screen.getByRole('group')).toBeInTheDocument()
    })

    it('renders with data-slot="button-group"', () => {
      render(<ButtonGroup>content</ButtonGroup>)
      expect(screen.getByRole('group')).toHaveAttribute(
        'data-slot',
        'button-group'
      )
    })

    it('renders children', () => {
      render(
        <ButtonGroup>
          <span>child</span>
        </ButtonGroup>
      )
      expect(screen.getByText('child')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<ButtonGroup className="custom-class">content</ButtonGroup>)
      expect(screen.getByRole('group')).toHaveClass('custom-class')
    })

    it('applies vertical orientation when specified', () => {
      render(<ButtonGroup orientation="vertical">content</ButtonGroup>)
      expect(screen.getByRole('group')).toHaveAttribute(
        'data-orientation',
        'vertical'
      )
    })

    it('applies horizontal orientation when specified', () => {
      render(<ButtonGroup orientation="horizontal">content</ButtonGroup>)
      expect(screen.getByRole('group')).toHaveAttribute(
        'data-orientation',
        'horizontal'
      )
    })

    it('forwards additional props', () => {
      render(<ButtonGroup data-testid="button-group-test">content</ButtonGroup>)
      expect(screen.getByTestId('button-group-test')).toBeInTheDocument()
    })

    it('renders as a div element', () => {
      render(<ButtonGroup data-testid="bg">content</ButtonGroup>)
      expect(screen.getByTestId('bg').tagName).toBe('DIV')
    })
  })

  describe('ButtonGroupText component', () => {
    it('renders children', () => {
      render(<ButtonGroupText>label</ButtonGroupText>)
      expect(screen.getByText('label')).toBeInTheDocument()
    })

    it('renders as div by default', () => {
      render(<ButtonGroupText data-testid="bgt">label</ButtonGroupText>)
      expect(screen.getByTestId('bgt').tagName).toBe('DIV')
    })

    it('renders as Slot when asChild is true', () => {
      render(
        <ButtonGroupText asChild data-testid="bgt-slot">
          label
        </ButtonGroupText>
      )
      expect(screen.getByTestId('bgt-slot')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(
        <ButtonGroupText className="custom-text-class">label</ButtonGroupText>
      )
      expect(screen.getByText('label')).toHaveClass('custom-text-class')
    })

    it('applies base classes', () => {
      render(<ButtonGroupText data-testid="bgt">label</ButtonGroupText>)
      expect(screen.getByTestId('bgt')).toHaveClass('bg-muted')
    })

    it('forwards additional props', () => {
      render(<ButtonGroupText aria-label="group-text">label</ButtonGroupText>)
      expect(screen.getByLabelText('group-text')).toBeInTheDocument()
    })
  })

  describe('ButtonGroupSeparator component', () => {
    it('renders a separator', () => {
      render(<ButtonGroupSeparator />)
      expect(screen.getByTestId('separator')).toBeInTheDocument()
    })

    it('has data-slot="button-group-separator"', () => {
      render(<ButtonGroupSeparator />)
      expect(screen.getByTestId('separator')).toHaveAttribute(
        'data-slot',
        'button-group-separator'
      )
    })

    it('defaults to vertical orientation', () => {
      render(<ButtonGroupSeparator />)
      expect(screen.getByTestId('separator')).toHaveAttribute(
        'data-orientation',
        'vertical'
      )
    })

    it('accepts horizontal orientation', () => {
      render(<ButtonGroupSeparator orientation="horizontal" />)
      expect(screen.getByTestId('separator')).toHaveAttribute(
        'data-orientation',
        'horizontal'
      )
    })

    it('applies custom className', () => {
      render(<ButtonGroupSeparator className="sep-custom" />)
      expect(screen.getByTestId('separator')).toHaveClass('sep-custom')
    })

    it('applies base classes', () => {
      render(<ButtonGroupSeparator />)
      expect(screen.getByTestId('separator')).toHaveClass('bg-input')
    })
  })

  describe('buttonGroupVariants', () => {
    it('returns a string', () => {
      expect(typeof buttonGroupVariants()).toBe('string')
    })

    it('includes horizontal variant classes by default', () => {
      const result = buttonGroupVariants()
      expect(result).toContain('rounded-l-none')
    })

    it('includes vertical variant classes when orientation is vertical', () => {
      const result = buttonGroupVariants({ orientation: 'vertical' })
      expect(result).toContain('flex-col')
    })

    it('includes horizontal variant classes when orientation is horizontal', () => {
      const result = buttonGroupVariants({ orientation: 'horizontal' })
      expect(result).toContain('rounded-l-none')
    })
  })

  describe('Composition', () => {
    it('renders ButtonGroup with ButtonGroupText and ButtonGroupSeparator', () => {
      render(
        <ButtonGroup data-testid="composed">
          <ButtonGroupText>Label</ButtonGroupText>
          <ButtonGroupSeparator />
          <button>Action</button>
        </ButtonGroup>
      )

      expect(screen.getByRole('group')).toBeInTheDocument()
      expect(screen.getByText('Label')).toBeInTheDocument()
      expect(screen.getByTestId('separator')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument()
    })

    it('renders multiple children inside ButtonGroup', () => {
      render(
        <ButtonGroup>
          <button>First</button>
          <button>Second</button>
          <button>Third</button>
        </ButtonGroup>
      )

      expect(screen.getByText('First')).toBeInTheDocument()
      expect(screen.getByText('Second')).toBeInTheDocument()
      expect(screen.getByText('Third')).toBeInTheDocument()
    })
  })
})
