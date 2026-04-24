import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { IdentityCard, SignaturesSection } from '../identity-card'
import { Form } from '@/components/ui/form'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

jest.mock('@/features/mails/components/compose/editor-core', () => ({
  CustomEditorCore: ({
    data,
    onChange,
  }: {
    data: string
    onChange: (v: string) => void
  }) => (
    <textarea
      aria-label="editor"
      defaultValue={data}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}))

jest.mock('../identity-fields', () => ({
  IdentityFields: () => <div data-testid="identity-fields" />,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_IDENTITY = {
  name: 'John Doe',
  mail: 'john@example.com',
  replyTo: 'john@example.com',
  isDefault: true,
  signatures: {},
}

/**
 * Wrapper that provides a real react-hook-form instance so `form.watch` works.
 */
function IdentityCardWrapper(
  props: Partial<React.ComponentProps<typeof IdentityCard>>
) {
  const form = useForm({
    defaultValues: {
      identities: [DEFAULT_IDENTITY],
    },
  })

  return (
    <IdentityCard
      form={form}
      index={0}
      identityCount={1}
      isCollapsed={false}
      onToggleCollapse={jest.fn()}
      onSetDefault={jest.fn()}
      onRemove={jest.fn()}
      {...props}
    />
  )
}

function SignaturesSectionWrapper(
  props: Partial<React.ComponentProps<typeof SignaturesSection>> & {
    initialSignatures?: Record<string, string>
  }
) {
  const { initialSignatures = {}, ...rest } = props
  const form = useForm({
    defaultValues: {
      identities: [{ ...DEFAULT_IDENTITY, signatures: initialSignatures }],
    },
  })

  return (
    <Form {...form}>
      <SignaturesSection form={form} identityIndex={0} {...rest} />
    </Form>
  )
}

// ── IdentityCard ──────────────────────────────────────────────────────────────

describe('IdentityCard', () => {
  describe('header', () => {
    it('renders the identity name and email', () => {
      render(<IdentityCardWrapper />)
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('john@example.com')).toBeInTheDocument()
    })

    it('shows "New Identity" when name is empty', () => {
      const form = () => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        return useForm({
          defaultValues: { identities: [{ ...DEFAULT_IDENTITY, name: '' }] },
        })
      }
      // Use wrapper with empty name
      function Wrapper() {
        const f = useForm({
          defaultValues: { identities: [{ ...DEFAULT_IDENTITY, name: '' }] },
        })
        return (
          <IdentityCard
            form={f}
            index={0}
            identityCount={1}
            isCollapsed={false}
            onToggleCollapse={jest.fn()}
            onSetDefault={jest.fn()}
            onRemove={jest.fn()}
          />
        )
      }
      render(<Wrapper />)
      expect(screen.getByText('New Identity')).toBeInTheDocument()
    })

    it('shows "—" when email is empty', () => {
      function Wrapper() {
        const f = useForm({
          defaultValues: { identities: [{ ...DEFAULT_IDENTITY, mail: '' }] },
        })
        return (
          <IdentityCard
            form={f}
            index={0}
            identityCount={1}
            isCollapsed={false}
            onToggleCollapse={jest.fn()}
            onSetDefault={jest.fn()}
            onRemove={jest.fn()}
          />
        )
      }
      render(<Wrapper />)
      expect(screen.getByText('—')).toBeInTheDocument()
    })

    it('renders the default badge when isDefault is true and showDefaultBadge is true', () => {
      render(<IdentityCardWrapper showDefaultBadge />)
      expect(screen.getByText('Default')).toBeInTheDocument()
    })

    it('hides the default badge when showDefaultBadge is false', () => {
      render(<IdentityCardWrapper showDefaultBadge={false} />)
      expect(screen.queryByText('Default')).not.toBeInTheDocument()
    })

    it('uses tProp for labels when provided', () => {
      const t = (key: string) => `translated:${key}`
      render(<IdentityCardWrapper t={t} showDefaultBadge />)
      expect(screen.getByText('translated:labels.default')).toBeInTheDocument()
    })
  })

  describe('initials', () => {
    it('renders correct initials from the identity name', () => {
      render(<IdentityCardWrapper />)
      expect(screen.getByText('JD')).toBeInTheDocument()
    })

    it('uses a custom getInitials function when provided', () => {
      render(<IdentityCardWrapper getInitials={() => 'XX'} />)
      expect(screen.getByText('XX')).toBeInTheDocument()
    })
  })

  describe('collapse / expand', () => {
    it('calls onToggleCollapse when the chevron button is clicked', async () => {
      const onToggleCollapse = jest.fn()
      render(<IdentityCardWrapper onToggleCollapse={onToggleCollapse} />)
      await userEvent.click(screen.getByRole('button', { name: /collapse/i }))
      expect(onToggleCollapse).toHaveBeenCalledTimes(1)
    })

    it('shows content (IdentityFields) when not collapsed', () => {
      render(<IdentityCardWrapper isCollapsed={false} />)
      expect(screen.getByTestId('identity-fields')).toBeInTheDocument()
    })

    it('hides content when collapsed', () => {
      render(<IdentityCardWrapper isCollapsed />)
      expect(screen.queryByTestId('identity-fields')).not.toBeInTheDocument()
    })
  })

  describe('remove button', () => {
    it('renders the remove button by default', () => {
      render(<IdentityCardWrapper />)
      expect(screen.getByRole('button', { name: '' })).toBeDefined()
      // Trash icon button exists
      expect(document.querySelector('svg.text-destructive')).toBeInTheDocument()
    })

    it('hides the remove button when showRemoveButton is false', () => {
      render(<IdentityCardWrapper showRemoveButton={false} />)
      // Only the collapse button should exist
      expect(screen.getAllByRole('button')).toHaveLength(1)
    })

    it('calls onRemove when remove button is clicked and identityCount > 1', async () => {
      const onRemove = jest.fn()
      render(<IdentityCardWrapper identityCount={2} onRemove={onRemove} />)
      const buttons = screen.getAllByRole('button')
      // Second button is the remove button
      await userEvent.click(buttons[1])
      expect(onRemove).toHaveBeenCalledTimes(1)
    })

    it('disables the remove button when identityCount is 1', () => {
      render(<IdentityCardWrapper identityCount={1} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons[1]).toBeDisabled()
    })
  })

  describe('children', () => {
    it('renders children inside the content area', () => {
      render(
        <IdentityCardWrapper isCollapsed={false}>
          <div data-testid="custom-child">Custom Content</div>
        </IdentityCardWrapper>
      )
      expect(screen.getByTestId('custom-child')).toBeInTheDocument()
    })

    it('does not render children when collapsed', () => {
      render(
        <IdentityCardWrapper isCollapsed>
          <div data-testid="custom-child">Custom Content</div>
        </IdentityCardWrapper>
      )
      expect(screen.queryByTestId('custom-child')).not.toBeInTheDocument()
    })
  })
})

// ── SignaturesSection ─────────────────────────────────────────────────────────

describe('SignaturesSection', () => {
  describe('adding signatures', () => {
    it('renders the add signature input and button', () => {
      render(<SignaturesSectionWrapper />)
      expect(
        screen.getByPlaceholderText('labels.signaturePlaceholder')
      ).toBeInTheDocument()
      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('disables the add button when input is empty', () => {
      render(<SignaturesSectionWrapper />)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    it('enables the add button when input has a value', async () => {
      render(<SignaturesSectionWrapper />)
      await userEvent.type(
        screen.getByPlaceholderText('labels.signaturePlaceholder'),
        'Work'
      )
      expect(screen.getByRole('button')).toBeEnabled()
    })

    it('adds a signature when the add button is clicked', async () => {
      render(<SignaturesSectionWrapper />)
      await userEvent.type(
        screen.getByPlaceholderText('labels.signaturePlaceholder'),
        'Work'
      )
      await userEvent.click(screen.getByRole('button'))
      expect(screen.getByText('Work')).toBeInTheDocument()
    })

    it('adds a signature when Enter is pressed in the input', async () => {
      render(<SignaturesSectionWrapper />)
      const input = screen.getByPlaceholderText('labels.signaturePlaceholder')
      await userEvent.type(input, 'Personal{Enter}')
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('clears the input after adding a signature', async () => {
      render(<SignaturesSectionWrapper />)
      const input = screen.getByPlaceholderText('labels.signaturePlaceholder')
      await userEvent.type(input, 'Work{Enter}')
      expect(input).toHaveValue('')
    })

    it('disables the add button for a duplicate signature name', async () => {
      render(
        <SignaturesSectionWrapper initialSignatures={{ Work: 'existing' }} />
      )
      await userEvent.type(
        screen.getByPlaceholderText('labels.signaturePlaceholder'),
        'Work'
      )
      expect(
        screen.getAllByRole('button')[screen.getAllByRole('button').length - 1]
      ).toBeDisabled()
    })
  })

  describe('existing signatures', () => {
    it('renders existing signatures', () => {
      render(
        <SignaturesSectionWrapper
          initialSignatures={{ Work: 'Hello', Personal: 'Hi' }}
        />
      )
      expect(screen.getByText('Work')).toBeInTheDocument()
      expect(screen.getByText('Personal')).toBeInTheDocument()
    })

    it('shows the editor by default (not collapsed)', () => {
      render(<SignaturesSectionWrapper initialSignatures={{ Work: 'Hello' }} />)
      expect(
        screen.getByRole('textbox', { name: 'editor' })
      ).toBeInTheDocument()
    })

    it('collapses a signature when its header is clicked', async () => {
      render(<SignaturesSectionWrapper initialSignatures={{ Work: 'Hello' }} />)
      await userEvent.click(screen.getByText('Work'))
      expect(
        screen.queryByRole('textbox', { name: 'editor' })
      ).not.toBeInTheDocument()
    })

    it('expands a collapsed signature when its header is clicked again', async () => {
      render(<SignaturesSectionWrapper initialSignatures={{ Work: 'Hello' }} />)
      await userEvent.click(screen.getByText('Work'))
      await userEvent.click(screen.getByText('Work'))
      expect(
        screen.getByRole('textbox', { name: 'editor' })
      ).toBeInTheDocument()
    })

    it('removes a signature when the trash button is clicked', async () => {
      render(<SignaturesSectionWrapper initialSignatures={{ Work: 'Hello' }} />)
      const trashButtons = screen.getAllByRole('button')
      // Last button before the add button is the trash for the signature
      const trashBtn = trashButtons.find((btn) =>
        btn.querySelector('svg.text-destructive')
      )!
      await userEvent.click(trashBtn)
      expect(screen.queryByText('Work')).not.toBeInTheDocument()
    })
  })
})
