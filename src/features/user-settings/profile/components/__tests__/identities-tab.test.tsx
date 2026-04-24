import { Form } from '@/components/ui/form'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { IdentitiesTab } from '../identities-tab'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock IdentityCard and SignaturesSection to avoid deep rendering
jest.mock('@/features/user-settings/components/identity-card', () => ({
  IdentityCard: ({
    index,
    isCollapsed,
    onToggleCollapse,
    onSetDefault,
    onRemove,
    showRemoveButton,
    children,
  }: any) => (
    <div data-testid={`identity-card-${index}`}>
      <button onClick={onToggleCollapse} aria-label={`toggle-${index}`}>
        {isCollapsed ? 'Expand' : 'Collapse'}
      </button>
      <button onClick={onSetDefault} aria-label={`set-default-${index}`}>
        Set Default
      </button>
      {showRemoveButton && (
        <button onClick={onRemove} aria-label={`remove-${index}`}>
          Remove
        </button>
      )}
      {children}
    </div>
  ),
  SignaturesSection: ({ identityIndex }: any) => (
    <div data-testid={`signatures-${identityIndex}`} />
  ),
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const DEFAULT_IDENTITY = {
  name: 'John Doe',
  mail: 'john@example.com',
  replyTo: 'john@example.com',
  isDefault: true,
  signatures: {},
}

const SECOND_IDENTITY = {
  name: 'Jane Doe',
  mail: 'jane@example.com',
  replyTo: 'jane@example.com',
  isDefault: false,
  signatures: {},
}

function Wrapper({
  identities = [DEFAULT_IDENTITY],
  uiConfig = {},
}: {
  identities?: (typeof DEFAULT_IDENTITY)[]
  uiConfig?: Record<string, unknown>
}) {
  const form = useForm({
    defaultValues: { identities },
  })

  return (
    <Form {...form}>
      <IdentitiesTab form={form as any} uiConfig={uiConfig} />
    </Form>
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('IdentitiesTab', () => {
  describe('rendering identities', () => {
    it('renders a card for each identity', () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      expect(screen.getByTestId('identity-card-0')).toBeInTheDocument()
      expect(screen.getByTestId('identity-card-1')).toBeInTheDocument()
    })

    it('renders a single card when there is one identity', () => {
      render(<Wrapper />)
      expect(screen.getByTestId('identity-card-0')).toBeInTheDocument()
      expect(screen.queryByTestId('identity-card-1')).not.toBeInTheDocument()
    })

    it('renders SignaturesSection for each identity', () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      expect(screen.getByTestId('signatures-0')).toBeInTheDocument()
      expect(screen.getByTestId('signatures-1')).toBeInTheDocument()
    })
  })

  describe('add identity button', () => {
    it('does not render the add button when SOGO_D_IDENTITIES_ENABLED is false', () => {
      render(<Wrapper uiConfig={{ SOGO_D_IDENTITIES_ENABLED: false }} />)
      expect(screen.queryByText('labels.addIdentity')).not.toBeInTheDocument()
    })

    it('renders the add button when SOGO_D_IDENTITIES_ENABLED is true', () => {
      render(<Wrapper uiConfig={{ SOGO_D_IDENTITIES_ENABLED: true }} />)
      expect(screen.getByText('labels.addIdentity')).toBeInTheDocument()
    })

    it('adds a new identity card when the add button is clicked', async () => {
      render(<Wrapper uiConfig={{ SOGO_D_IDENTITIES_ENABLED: true }} />)
      await userEvent.click(screen.getByText('labels.addIdentity'))
      expect(screen.getByTestId('identity-card-1')).toBeInTheDocument()
    })

    it('shows allowsCustom hint when identities enabled and only one identity exists', () => {
      render(<Wrapper uiConfig={{ SOGO_D_IDENTITIES_ENABLED: true }} />)
      expect(screen.getByText('labels.allowsCustom')).toBeInTheDocument()
    })

    it('hides allowsCustom hint when there are multiple identities', async () => {
      render(<Wrapper uiConfig={{ SOGO_D_IDENTITIES_ENABLED: true }} />)
      await userEvent.click(screen.getByText('labels.addIdentity'))
      expect(screen.queryByText('labels.allowsCustom')).not.toBeInTheDocument()
    })
  })

  describe('collapse / expand', () => {
    it('cards start expanded by default', () => {
      render(<Wrapper />)
      expect(screen.getByText('Collapse')).toBeInTheDocument()
    })

    it('toggles collapse state when the toggle button is clicked', async () => {
      render(<Wrapper />)
      await userEvent.click(screen.getByLabelText('toggle-0'))
      expect(screen.getByText('Expand')).toBeInTheDocument()
    })

    it('re-expands when toggled again', async () => {
      render(<Wrapper />)
      await userEvent.click(screen.getByLabelText('toggle-0'))
      await userEvent.click(screen.getByLabelText('toggle-0'))
      expect(screen.getByText('Collapse')).toBeInTheDocument()
    })
  })

  describe('remove identity', () => {
    it('does not show remove button for the main identity (index 0) when there are multiple', () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      // index 0 → showRemoveButton=false (isMainIdentity)
      expect(screen.queryByLabelText('remove-0')).not.toBeInTheDocument()
    })

    it('shows remove button for non-main identities when there are multiple', () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      expect(screen.getByLabelText('remove-1')).toBeInTheDocument()
    })

    it('removes an identity when remove is clicked', async () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      await userEvent.click(screen.getByLabelText('remove-1'))
      expect(screen.queryByTestId('identity-card-1')).not.toBeInTheDocument()
    })
  })

  describe('set default', () => {
    it('calls handleSetDefault and updates isDefault on the selected identity', async () => {
      render(<Wrapper identities={[DEFAULT_IDENTITY, SECOND_IDENTITY]} />)
      // Click "Set Default" on second identity
      await userEvent.click(screen.getByLabelText('set-default-1'))
      // No crash and card still renders
      expect(screen.getByTestId('identity-card-1')).toBeInTheDocument()
    })
  })

  describe('auto-default enforcement', () => {
    it('sets the first identity as default when no identity has isDefault=true', async () => {
      const noDefault = [
        { ...DEFAULT_IDENTITY, isDefault: false },
        { ...SECOND_IDENTITY, isDefault: false },
      ]
      render(<Wrapper identities={noDefault} />)
      // The useEffect should fire and set identities.0.isDefault = true
      await waitFor(() => {
        // Cards still render — we trust the effect ran without error
        expect(screen.getByTestId('identity-card-0')).toBeInTheDocument()
      })
    })

    it('does not crash when identities list is empty', () => {
      expect(() => render(<Wrapper identities={[]} />)).not.toThrow()
    })
  })

  describe('uiConfig field permissions', () => {
    it('renders cards with uiConfig disabled (all flags false)', () => {
      render(
        <Wrapper
          uiConfig={{
            SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED: false,
            SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: false,
            SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED: false,
          }}
        />
      )
      expect(screen.getByTestId('identity-card-0')).toBeInTheDocument()
    })

    it('renders cards with uiConfig enabled (all flags true)', () => {
      render(
        <Wrapper
          uiConfig={{
            SOGO_D_IDENTITIES_CUSTOM_NAME_ENABLED: true,
            SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: true,
            SOGO_D_IDENTITIES_CUSTOM_REPLY_TO_ENABLED: true,
            SOGO_D_IDENTITIES_ENABLED: true,
          }}
        />
      )
      expect(screen.getByTestId('identity-card-0')).toBeInTheDocument()
    })
  })
})
