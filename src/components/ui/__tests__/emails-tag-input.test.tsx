import '@testing-library/jest-dom'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { EmailsTagInput } from '../emails-tag-input'

jest.mock('@/lib/utils', () => ({
  cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
  tagDismissButtonClassName: (extra?: string) =>
    extra ? `tag-dismiss ${extra}` : 'tag-dismiss',
}))

jest.mock('@/lib/validations', () => ({
  isValidEmail: jest.fn((email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
}))

jest.mock('lucide-react', () => ({
  X: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="icon-x" {...props} />
  ),
}))

describe('EmailsTagInput', () => {
  const onChange = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders email input with custom placeholder when empty', () => {
      render(
        <EmailsTagInput
          placeholder="Add recipients"
          value={[]}
          onChange={onChange}
        />
      )
      expect(
        screen.getByPlaceholderText('Add recipients')
      ).toBeInTheDocument()
    })

    it('renders existing emails as removable badges', () => {
      render(
        <EmailsTagInput
          value={['alice@example.com', 'bob@example.com']}
          onChange={onChange}
        />
      )
      expect(screen.getByText('alice@example.com')).toBeInTheDocument()
      expect(screen.getByText('bob@example.com')).toBeInTheDocument()
      expect(screen.getAllByRole('button', { name: /Remove/i })).toHaveLength(2)
    })
  })

  describe('configuration', () => {
    it('applies custom className on root container', () => {
      const { container } = render(
        <EmailsTagInput
          value={[]}
          onChange={onChange}
          className="custom-emails-input"
        />
      )
      expect(container.firstChild).toHaveClass('custom-emails-input')
    })

    it('disables input when disabled prop is true', () => {
      render(
        <EmailsTagInput value={[]} onChange={onChange} disabled />
      )
      expect(screen.getByRole('textbox')).toBeDisabled()
    })

    it('disables input when maxEmails limit is reached', () => {
      render(
        <EmailsTagInput
          value={['one@example.com']}
          onChange={onChange}
          maxEmails={1}
        />
      )
      expect(screen.getByRole('textbox')).toBeDisabled()
    })
  })

  describe('accessibility', () => {
    it('exposes aria-invalid and error description when validation fails', async () => {
      const user = userEvent.setup()
      render(<EmailsTagInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'not-an-email{Enter}')

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-invalid', 'true')
      })
      expect(input).toHaveAttribute('aria-describedby', 'email-error')
      expect(
        screen.getByText('Please enter a valid email address.')
      ).toBeInTheDocument()
    })

    it('remove buttons have accessible labels', () => {
      render(
        <EmailsTagInput value={['user@example.com']} onChange={onChange} />
      )
      expect(
        screen.getByRole('button', { name: 'Remove user@example.com' })
      ).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('adds a valid email on Enter and clears input', async () => {
      const user = userEvent.setup()
      render(<EmailsTagInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'new@example.com{Enter}')

      expect(onChange).toHaveBeenCalledWith(['new@example.com'])
    })

    it('adds email on blur when input has value', async () => {
      const user = userEvent.setup()
      render(<EmailsTagInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      await user.type(input, 'blur@example.com')
      fireEvent.blur(input)

      expect(onChange).toHaveBeenCalledWith(['blur@example.com'])
    })

    it('removes email when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      render(
        <EmailsTagInput value={['keep@example.com']} onChange={onChange} />
      )

      await user.click(
        screen.getByRole('button', { name: 'Remove keep@example.com' })
      )

      expect(onChange).toHaveBeenCalledWith([])
    })

    it('rejects duplicate emails', async () => {
      const user = userEvent.setup()
      render(
        <EmailsTagInput value={['dup@example.com']} onChange={onChange} />
      )

      const input = screen.getByRole('textbox')
      await user.type(input, 'dup@example.com{Enter}')

      expect(onChange).not.toHaveBeenCalled()
      expect(
        screen.getByText('This email has already been added.')
      ).toBeInTheDocument()
    })

    it('enforces maxEmails on add', async () => {
      const user = userEvent.setup()
      render(
        <EmailsTagInput
          value={['a@example.com']}
          onChange={onChange}
          maxEmails={1}
        />
      )

      const input = screen.getByRole('textbox')
      expect(input).toBeDisabled()
    })

    it('removes last email on Backspace when input is empty', async () => {
      const user = userEvent.setup()
      render(
        <EmailsTagInput
          value={['first@example.com', 'second@example.com']}
          onChange={onChange}
        />
      )

      const input = screen.getByRole('textbox')
      await user.click(input)
      await user.keyboard('{Backspace}')

      expect(onChange).toHaveBeenCalledWith(['first@example.com'])
    })

    it('adds multiple valid emails from paste', () => {
      render(<EmailsTagInput value={[]} onChange={onChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.paste(input, {
        clipboardData: {
          getData: () => 'one@example.com, two@example.com',
        },
      })

      expect(onChange).toHaveBeenCalledWith([
        'one@example.com',
        'two@example.com',
      ])
    })
  })

  describe('component stability', () => {
    it('renders consistently across re-renders with updated value', () => {
      const { rerender } = render(
        <EmailsTagInput value={[]} onChange={onChange} />
      )
      rerender(
        <EmailsTagInput value={['stable@example.com']} onChange={onChange} />
      )
      expect(screen.getByText('stable@example.com')).toBeInTheDocument()
    })
  })
})
