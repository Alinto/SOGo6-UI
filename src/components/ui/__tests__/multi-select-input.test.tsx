import '@testing-library/jest-dom'
import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import MultiSelectInput from '../multi-select-input'

jest.mock('@/lib/utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
  tagDismissButtonClassName: (extra?: string) =>
    extra ? `tag-dismiss ${extra}` : 'tag-dismiss',
}))

jest.mock('lucide-react', () => ({
  XCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-x-circle" {...props} />
  ),
}))

describe('MultiSelectInput', () => {
  const onChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders input with default placeholder', () => {
      render(<MultiSelectInput value={[]} onChange={onChange} />)
      expect(
        screen.getByPlaceholderText('Add value and press Enter')
      ).toBeInTheDocument()
    })

    it('renders custom placeholder', () => {
      render(
        <MultiSelectInput
          value={[]}
          onChange={onChange}
          placeholder="Add tag"
        />
      )
      expect(screen.getByPlaceholderText('Add tag')).toBeInTheDocument()
    })

    it('renders existing values as badges', () => {
      render(
        <MultiSelectInput value={['alpha', 'beta']} onChange={onChange} />
      )
      expect(screen.getByText('alpha')).toBeInTheDocument()
      expect(screen.getByText('beta')).toBeInTheDocument()
    })
  })

  describe('configuration', () => {
    it('uses id from props', () => {
      render(
        <MultiSelectInput
          value={[]}
          onChange={onChange}
          id="custom-multiselect"
        />
      )
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'id',
        'custom-multiselect'
      )
    })

    it('generates id from name when id is omitted', () => {
      render(
        <MultiSelectInput
          value={[]}
          onChange={onChange}
          name="categories"
        />
      )
      expect(screen.getByRole('textbox')).toHaveAttribute(
        'id',
        'multi-select-input-categories'
      )
    })

    it('disables input when disabled prop is true', () => {
      render(<MultiSelectInput value={[]} onChange={onChange} disabled />)
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('exposes group role and aria-label from placeholder', () => {
      render(
        <MultiSelectInput
          value={[]}
          onChange={onChange}
          placeholder="Tags"
        />
      )
      expect(screen.getByRole('group', { name: 'Tags' })).toBeInTheDocument()
    })

    it('remove buttons have accessible labels', () => {
      render(
        <MultiSelectInput value={['item-a']} onChange={onChange} />
      )
      expect(
        screen.getByRole('button', { name: 'Remove item-a' })
      ).toBeInTheDocument()
    })

    it('marks container as aria-disabled when disabled', () => {
      render(<MultiSelectInput value={[]} onChange={onChange} disabled />)
      expect(screen.getByRole('group')).toHaveAttribute('aria-disabled', 'true')
    })
  })

  describe('integration', () => {
    it('adds a tag on Enter', async () => {
      const user = userEvent.setup()
      render(<MultiSelectInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'new-tag{Enter}')

      expect(onChange).toHaveBeenCalledWith(['new-tag'])
    })

    it('adds a tag on blur when input has value', async () => {
      const user = userEvent.setup()
      render(<MultiSelectInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'blur-tag')
      fireEvent.blur(input)

      expect(onChange).toHaveBeenCalledWith(['blur-tag'])
    })

    it('removes tag when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <MultiSelectInput value={['remove-me']} onChange={onChange} />
      )

      await user.click(
        screen.getByRole('button', { name: 'Remove remove-me' })
      )

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('does not remove tag when disabled', async () => {
      const user = userEvent.setup()
      render(
        <MultiSelectInput
          value={['locked']}
          onChange={onChange}
          disabled
        />
      )

      await user.click(screen.getByRole('button', { name: 'Remove locked' }))

      expect(onChange).not.toHaveBeenCalled()
    })

    it('removes last tag on Backspace when input is empty', async () => {
      const user = userEvent.setup()
      render(
        <MultiSelectInput value={['first', 'second']} onChange={onChange} />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.keyboard('{Backspace}')

      expect(onChange).toHaveBeenCalledWith(['first'])
    })

    it('skips duplicate values when dedupe is enabled', async () => {
      const user = userEvent.setup()
      render(
        <MultiSelectInput
          value={['dup']}
          onChange={onChange}
          dedupe
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'dup{Enter}')

      expect(onChange).not.toHaveBeenCalled()
    })

    it('applies normalize before adding', async () => {
      const user = userEvent.setup()
      const normalize = (v: string) => v.trim().toUpperCase()

      render(
        <MultiSelectInput
          value={[]}
          onChange={onChange}
          normalize={normalize}
        />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, '  lower  {Enter}')

      expect(onChange).toHaveBeenCalledWith(['LOWER'])
    })
  })

  describe('component stability', () => {
    it('renders consistently across re-renders with updated value', () => {
      const { rerender } = render(
        <MultiSelectInput value={[]} onChange={onChange} />
      )
      rerender(
        <MultiSelectInput value={['stable']} onChange={onChange} />
      )
      expect(screen.getByText('stable')).toBeInTheDocument()
    })
  })

  describe('custom styling', () => {
    it('applies disabled opacity classes on container', () => {
      const { container } = render(
        <MultiSelectInput value={[]} onChange={onChange} disabled />
      )
      const group = container.querySelector('[role="group"]')
      expect(group).toHaveClass('cursor-not-allowed', 'opacity-50')
    })
  })
})
