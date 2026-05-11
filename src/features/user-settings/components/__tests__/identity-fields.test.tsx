import { Form } from '@/components/ui/form'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { IdentityFields, emptyIdentity } from '../identity-fields'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_IDENTITY = {
  name: 'John Doe',
  mail: 'john@example.com',
  replyTo: 'reply@example.com',
  isDefault: false,
  signatures: {},
}

interface WrapperProps extends Partial<
  React.ComponentProps<typeof IdentityFields>
> {
  initialValues?: typeof DEFAULT_IDENTITY
}

function Wrapper({ initialValues = DEFAULT_IDENTITY, ...props }: WrapperProps) {
  const form = useForm({
    defaultValues: {
      identities: [initialValues],
    },
  })

  return (
    <Form {...form}>
      <IdentityFields
        form={form}
        index={0}
        identityCount={2}
        onSetDefault={jest.fn()}
        {...props}
      />
    </Form>
  )
}

// ── emptyIdentity ─────────────────────────────────────────────────────────────

describe('emptyIdentity', () => {
  it('has the correct shape with empty defaults', () => {
    expect(emptyIdentity).toEqual({
      name: '',
      mail: '',
      replyTo: '',
      isDefault: false,
      signatures: {},
    })
  })
})

// ── IdentityFields ────────────────────────────────────────────────────────────

describe('IdentityFields', () => {
  describe('rendered fields', () => {
    it('renders name, email and replyTo inputs', () => {
      render(<Wrapper />)
      expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('user@example.com')
      ).toBeInTheDocument()
      expect(
        screen.getByPlaceholderText('noreply@example.com')
      ).toBeInTheDocument()
    })

    it('pre-fills inputs with form values', () => {
      render(<Wrapper />)
      expect(screen.getByPlaceholderText('John Doe')).toHaveValue('John Doe')
      expect(screen.getByPlaceholderText('user@example.com')).toHaveValue(
        'john@example.com'
      )
      expect(screen.getByPlaceholderText('noreply@example.com')).toHaveValue(
        'reply@example.com'
      )
    })
  })

  describe('labels', () => {
    it('renders translation keys as labels by default', () => {
      render(<Wrapper />)
      // useTranslations mock returns the key, so labels.name → "labels.name"
      expect(screen.getByText('labels.name')).toBeInTheDocument()
      expect(screen.getByText('labels.email')).toBeInTheDocument()
      expect(screen.getByText('labels.replyTo')).toBeInTheDocument()
    })

    it('uses custom fieldLabels when provided', () => {
      render(
        <Wrapper
          fieldLabels={{
            name: 'Display Name',
            email: 'Email Address',
            replyTo: 'Reply-To',
          }}
        />
      )
      expect(screen.getByText('Display Name')).toBeInTheDocument()
      expect(screen.getByText('Email Address')).toBeInTheDocument()
      expect(screen.getByText('Reply-To')).toBeInTheDocument()
    })
  })

  describe('field descriptions', () => {
    it('does not render descriptions by default', () => {
      render(<Wrapper />)
      // No description text should appear unless explicitly passed
      expect(screen.queryByText('Name description')).not.toBeInTheDocument()
    })

    it('renders field descriptions when provided', () => {
      render(
        <Wrapper
          fieldDescriptions={{
            name: 'Name description',
            email: 'Email description',
            replyTo: 'ReplyTo description',
          }}
        />
      )
      expect(screen.getByText('Name description')).toBeInTheDocument()
      expect(screen.getByText('Email description')).toBeInTheDocument()
      expect(screen.getByText('ReplyTo description')).toBeInTheDocument()
    })
  })

  describe('disabled fields', () => {
    it('disables the name input when disableFields.name is true', () => {
      render(<Wrapper disableFields={{ name: true }} />)
      expect(screen.getByPlaceholderText('John Doe')).toBeDisabled()
    })

    it('disables the mail input when disableFields.mail is true', () => {
      render(<Wrapper disableFields={{ mail: true }} />)
      expect(screen.getByPlaceholderText('user@example.com')).toBeDisabled()
    })

    it('disables the replyTo input when disableFields.replyTo is true', () => {
      render(<Wrapper disableFields={{ replyTo: true }} />)
      expect(screen.getByPlaceholderText('noreply@example.com')).toBeDisabled()
    })
  })

  describe('read-only mail field', () => {
    it('renders a static span instead of an input when readOnlyFields.mail is true', () => {
      render(<Wrapper readOnlyFields={{ mail: true }} />)
      expect(
        screen.queryByPlaceholderText('user@example.com')
      ).not.toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('renders an editable input when readOnlyFields.mail is false', () => {
      render(<Wrapper readOnlyFields={{ mail: false }} />)
      expect(
        screen.getByPlaceholderText('user@example.com')
      ).toBeInTheDocument()
    })
  })

  describe('isDefault checkbox', () => {
    it('shows the checkbox when identityCount > 1 and isDefault is not disabled', () => {
      render(<Wrapper identityCount={2} />)
      expect(screen.getByRole('checkbox')).toBeInTheDocument()
    })

    it('hides the checkbox when identityCount is 1', () => {
      render(<Wrapper identityCount={1} />)
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('hides the checkbox when disableFields.isDefault is true', () => {
      render(<Wrapper identityCount={2} disableFields={{ isDefault: true }} />)
      expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
    })

    it('calls onSetDefault when checkbox is checked', async () => {
      const onSetDefault = jest.fn()
      render(<Wrapper identityCount={2} onSetDefault={onSetDefault} />)
      await userEvent.click(screen.getByRole('checkbox'))
      expect(onSetDefault).toHaveBeenCalledTimes(1)
    })

    it('does not call onSetDefault when checkbox is unchecked', async () => {
      const onSetDefault = jest.fn()
      // Start with isDefault: true so the checkbox is checked
      render(
        <Wrapper
          identityCount={2}
          onSetDefault={onSetDefault}
          initialValues={{ ...DEFAULT_IDENTITY, isDefault: true }}
        />
      )
      await userEvent.click(screen.getByRole('checkbox'))
      // onCheckedChange only calls onSetDefault when checked=true
      expect(onSetDefault).not.toHaveBeenCalled()
    })

    it('uses custom isDefault label when provided', () => {
      render(
        <Wrapper
          identityCount={2}
          fieldLabels={{ isDefault: 'Set as primary identity' }}
        />
      )
      expect(screen.getByText('Set as primary identity')).toBeInTheDocument()
    })

    it('uses custom isDefaultDescription when provided', () => {
      render(
        <Wrapper
          identityCount={2}
          fieldLabels={{
            isDefaultDescription: 'This will be your primary identity',
          }}
        />
      )
      expect(
        screen.getByText('This will be your primary identity')
      ).toBeInTheDocument()
    })

    it('falls back to translation keys for isDefault labels', () => {
      render(<Wrapper identityCount={2} />)
      expect(
        screen.getByText('labels.useDefaultIdentity.string')
      ).toBeInTheDocument()
      expect(
        screen.getByText('description.useDefaultIdentity.string')
      ).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('updates the name input when the user types', async () => {
      render(<Wrapper initialValues={{ ...DEFAULT_IDENTITY, name: '' }} />)
      const input = screen.getByPlaceholderText('John Doe')
      await userEvent.type(input, 'Jane')
      expect(input).toHaveValue('Jane')
    })

    it('updates the replyTo input when the user types', async () => {
      render(<Wrapper initialValues={{ ...DEFAULT_IDENTITY, replyTo: '' }} />)
      const input = screen.getByPlaceholderText('noreply@example.com')
      await userEvent.type(input, 'other@example.com')
      expect(input).toHaveValue('other@example.com')
    })
  })
})
