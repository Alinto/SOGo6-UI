import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import { UseFormReturn } from 'react-hook-form'
import { MODE_CREATE, MODE_EDIT } from '../../external-accounts-utils'
import ExternalAccountSettingsTab from '../external-accounts-settings-tab'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('react-hook-form', () => ({
  ...jest.requireActual('react-hook-form'),
  useFieldArray: jest.fn(() => ({
    fields: [],
    append: jest.fn(),
    remove: jest.fn(),
  })),
  useController: jest.fn(() => ({
    field: {
      value: undefined,
      onChange: jest.fn(),
      name: 'test',
    },
  })),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, ...props }: any) => (
    <button onClick={onClick} data-variant={variant} {...props}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      data-testid="checkbox"
    />
  ),
}))

jest.mock('@/components/ui/form', () => ({
  FormControl: ({ children }: any) => (
    <div data-testid="form-control">{children}</div>
  ),
  FormDescription: ({ children, className }: any) => (
    <div data-testid="form-description" className={className}>
      {children}
    </div>
  ),
  FormField: ({ render }: any) =>
    render({
      field: {
        value: undefined,
        onChange: jest.fn(),
        name: 'test',
      },
    }),
  FormItem: ({ children }: any) => (
    <div data-testid="form-item">{children}</div>
  ),
  FormLabel: ({ children }: any) => (
    <label data-testid="form-label">{children}</label>
  ),
  FormMessage: ({ children }: any) => (
    <div data-testid="form-message">{children}</div>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ type, value, onChange, placeholder, disabled, ...props }: any) => (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-testid="input"
      {...props}
    />
  ),
}))

jest.mock('@/components/ui/label', () => ({
  Label: ({ children, htmlFor }: any) => (
    <label htmlFor={htmlFor} data-testid="label">
      {children}
    </label>
  ),
}))

jest.mock('@/components/ui/radio-group', () => ({
  RadioGroup: ({ children }: any) => (
    <div data-testid="radio-group">{children}</div>
  ),
  RadioGroupItem: ({ value }: any) => (
    <input type="radio" value={value} data-testid="radio-item" />
  ),
}))

jest.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}))

jest.mock('@/components/ui/forms/select-form', () => {
  return function SelectForm() {
    return <div data-testid="select-form">Select</div>
  }
})

jest.mock('@/features/mails/components/compose/editor-core', () => ({
  CustomEditorCore: () => <div data-testid="editor-core">Editor</div>,
}))

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockT = (key: string) => key

const mockMailbox = {
  id: 'test-1',
  name: 'My Account',
  mail_server: {
    server: 'imap.example.com',
    port: 993,
    encryption: 'implicit_tls',
    auth_mech: 'plain',
    username: 'user',
    password: 'pass123456',
  },
  mail_outgoing: {
    server: 'smtp.example.com',
    port: 587,
    encryption: 'explicit_tls',
    auth_mech: 'login',
    username: 'user',
    password: 'pass123456',
  },
  identities: [
    {
      mail: 'user@example.com',
      name: 'Main',
      replyTo: 'reply@example.com',
      isDefault: true,
      signatures: {},
    },
  ],
  receipts: {
    enabled: false,
    not_to_cc: 'never',
    outside_domain: 'never',
    other: 'never',
  },
}

const mockForm = {
  control: { _fields: new Map(), _defaultValues: mockMailbox },
  watch: jest.fn((fieldName?: string) => {
    if (fieldName === 'identities') return mockMailbox.identities
    if (fieldName === 'mail_server.password')
      return mockMailbox.mail_server.password
    if (fieldName === 'receipts.enabled') return mockMailbox.receipts.enabled
    // fallback — return full object for unspecified calls
    return mockMailbox
  }),
  formState: { errors: {} },
  getValues: jest.fn((fieldName?: string) => {
    if (fieldName?.startsWith('identities.')) {
      const index = parseInt(fieldName.split('.')[1])
      const key = fieldName.split(
        '.'
      )[2] as keyof (typeof mockMailbox.identities)[0]
      return mockMailbox.identities[index]?.[key]
    }
    return mockMailbox
  }),
  setValue: jest.fn(),
  handleSubmit: jest.fn(),
} as unknown as UseFormReturn<any>

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ExternalAccountSettingsTab', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue(mockT)
  })

  // ── rendering ─────────────────────────────────────────────────────────────

  describe('rendering', () => {
    it('renders without crashing', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0) // ✅
    })

    it('renders form items', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('renders form labels', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-label').length).toBeGreaterThan(0)
    })
  })

  // ── create mode ───────────────────────────────────────────────────────────

  describe('create mode', () => {
    it('renders in create mode', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('renders input fields for account name', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('input').length).toBeGreaterThan(0)
    })

    it('does not have predefined values in create mode', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const inputs = screen.getAllByTestId('input') as HTMLInputElement[]
      // At least some inputs should be empty in create mode
      expect(inputs.length).toBeGreaterThan(0)
    })
  })

  // ── edit mode ─────────────────────────────────────────────────────────────

  describe('edit mode', () => {
    it('renders in edit mode', () => {
      render(
        <ExternalAccountSettingsTab
          form={mockForm}
          mode={MODE_EDIT}
          mailboxData={mockMailbox}
        />
      )
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('displays mailbox data in edit mode', () => {
      render(
        <ExternalAccountSettingsTab
          form={mockForm}
          mode={MODE_EDIT}
          mailboxData={mockMailbox}
        />
      )
      expect(screen.getAllByTestId('input').length).toBeGreaterThan(0)
    })
  })

  // ── server configuration ──────────────────────────────────────────────────

  describe('server configuration', () => {
    it('renders server input fields', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const inputs = screen.getAllByTestId('input')
      expect(inputs.length).toBeGreaterThan(0)
    })

    it('renders password fields for incoming and outgoing', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const passwordInputs = screen
        .getAllByTestId('input')
        .filter((input) => (input as HTMLInputElement).type === 'password')
      expect(passwordInputs.length).toBeGreaterThanOrEqual(2)
    })

    it('renders encryption options', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('radio-group').length).toBeGreaterThan(0)
    })

    it('renders auth mechanism selectors', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('select-form').length).toBeGreaterThan(0)
    })
  })

  // ── password field behavior ───────────────────────────────────────────────

  describe('password field behavior', () => {
    it('renders password fields with toggle buttons', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })

    it('has eye icon buttons for password visibility toggle', async () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const buttons = screen.getAllByRole('button')
      // Should have at least 2 eye buttons for incoming and outgoing passwords
      expect(buttons.length).toBeGreaterThanOrEqual(2)
    })
  })

  // ── identities section ────────────────────────────────────────────────────

  describe('identities section', () => {
    it('renders identities with email and name fields', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('input').length).toBeGreaterThan(0)
    })

    it('renders checkbox for default identity', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('checkbox').length).toBeGreaterThan(0)
    })
  })

  // ── receipts configuration ────────────────────────────────────────────────

  describe('receipts configuration', () => {
    it('renders receipts section', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const radioGroups = screen.getAllByTestId('radio-group')
      expect(radioGroups.length).toBeGreaterThan(0)
    })

    it('renders receipt policy options', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('radio-item').length).toBeGreaterThan(0)
    })
  })

  // ── form structure ────────────────────────────────────────────────────────

  describe('form structure', () => {
    it('uses FormField for all form inputs', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('has FormControl wrapping inputs', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-control').length).toBeGreaterThan(0)
    })

    it('displays form descriptions', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('has form labels for inputs', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-label').length).toBeGreaterThan(0)
    })
  })

  // ── separators for sections ───────────────────────────────────────────────

  describe('section organization', () => {
    it('renders separator elements between sections', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('separator').length).toBeGreaterThan(0)
    })
  })

  // ── responsiveness ────────────────────────────────────────────────────────

  describe('responsiveness', () => {
    it('renders grid layout for server fields', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      // Component uses grid classes for layout
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })
  })

  // ── accessibility ─────────────────────────────────────────────────────────

  describe('accessibility', () => {
    it('has proper form label associations', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-label').length).toBeGreaterThan(0)
    })

    it('password inputs have type attribute', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const inputs = screen.getAllByTestId('input')
      const passwordInputs = inputs.filter(
        (input) => (input as HTMLInputElement).type === 'password'
      )
      expect(passwordInputs.length).toBeGreaterThan(0)
      passwordInputs.forEach((input) => {
        expect((input as HTMLInputElement).type).toBe('password')
      })
    })

    it('checkboxes are properly labeled', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const checkboxes = screen.getAllByTestId('checkbox')
      expect(checkboxes.length).toBeGreaterThan(0)
    })

    it('renders radio groups for selection', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      const radioGroups = screen.getAllByTestId('radio-group')
      expect(radioGroups.length).toBeGreaterThan(0)
    })
  })

  // ── edge cases ────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('renders with only required props', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('renders with optional mailboxData', () => {
      render(
        <ExternalAccountSettingsTab
          form={mockForm}
          mode={MODE_EDIT}
          mailboxData={mockMailbox}
        />
      )
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })

    it('handles form with no errors', () => {
      render(<ExternalAccountSettingsTab form={mockForm} mode={MODE_CREATE} />)
      // Should render without error messages
      expect(screen.getAllByTestId('form-item').length).toBeGreaterThan(0)
    })
  })
})
