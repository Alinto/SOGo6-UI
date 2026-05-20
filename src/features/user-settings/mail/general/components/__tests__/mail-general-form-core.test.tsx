import { render, screen } from '@testing-library/react'
import { useTranslations } from 'next-intl'
import MailGeneralSettingsForm from '../mail-general-form-core'

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/checkbox', () => ({
  Checkbox: ({ checked, onCheckedChange }: any) => (
    <input
      type="checkbox"
      checked={checked ?? false}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: any) => <input {...props} />,
}))

jest.mock('@/components/seconds-input', () => ({
  SecondsInput: (props: any) => (
    <input data-testid="seconds-input" type="number" {...props} />
  ),
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: any) => <div>{children}</div>,
  FormControl: ({ children }: any) => <div>{children}</div>,
  FormField: ({ name, render }: any) =>
    render({ field: { value: '', onChange: jest.fn() } }),
  FormItem: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  FormLabel: ({ children, ...props }: any) => (
    <label {...props}>{children}</label>
  ),
}))

jest.mock('@/components/ui/forms/select-form', () => {
  return function MockSelectForm({ value, onValueChange, options }: any) {
    return (
      <select
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        data-testid="select"
      >
        {options?.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    )
  }
})

jest.mock('@/components/ui/forms/fixed-form-button-group', () => {
  return function MockFixedFormButtonGroup(props: any) {
    return (
      <div data-testid="button-group">
        <button
          type="button"
          onClick={props.onReset}
          disabled={props.disableReset}
          data-testid="reset-btn"
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={props.disableSubmit}
          data-testid="submit-btn"
        >
          Submit
        </button>
      </div>
    )
  }
})

jest.mock('../../../store/mail-utils', () => ({
  mapApiToMailGeneralSettings: jest.fn((data) => data),
  mapMailGeneralSettingsToApi: jest.fn((data) => data),
}))

jest.mock('../mail-general-schema', () => ({
  schema: {},
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: any) => ({ values, errors: {} })),
}))

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockUpdate = jest.fn()

const mockData = {
  composeMailWindow: 'popup',
  collectUnknownAddresses: false,
  collectUnknownAddressbookName: '',
  countAllUnseen: false,
  sortByThreads: false,
  hideInlineAttachments: false,
  autoMarkAsReadDelay: 5,
  forwardMessages: 'inline',
  startReply: 'above',
  placeSignature: 'below',
  signOnNew: false,
  signOnReply: false,
  signOnForward: false,
  composeIn: 'html',
  mailAllowReceipt: false,
  mailfolderSubscribe: false,
}

// ─── Setup ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks()
  ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      US_MAIL_GENERAL: {
        'compose_mail_window.string': 'Compose mail window',
        'compose_mail_window.popup.string': 'Popup',
        'compose_mail_window.inline.string': 'Inline',
        'collect_unknown_addresses.string': 'Collect unknown addresses',
        'collect_unknown_addressbook_name.string': 'Address book name',
        'fetch_count_of_unseen_messages.string':
          'Fetch count of unseen messages',
        'sort_messages_by_threads.string': 'Sort messages by threads',
        'hide_attachments_for_inline_images.string':
          'Hide attachments for inline images',
        'automatically_mark_messages_as_read.string':
          'Automatically mark messages as read',
        'forward_messages.title.string': 'Forward messages',
        'forward_messages.as_inline.string': 'As inline',
        'forward_messages.as_attachment.string': 'As attachment',
        'start_reply.title.string': 'Start reply',
        'start_reply.to_above.string': 'Above message',
        'start_reply.to_below.string': 'Below message',
        'place_signature.title.string': 'Place signature',
        'place_signature.above.string': 'Above',
        'place_signature.below.string': 'Below',
        'sign_on.new.string': 'Sign on new',
        'sign_on.reply.string': 'Sign on reply',
        'sign_on.forward.string': 'Sign on forward',
        'compose_message_in.string': 'Compose in',
        'display_remote_images.string': 'Display remote images',
        'mail_allow_receipt.string': 'Allow read receipts',
        'mail_folder_subscribe.string': 'Mail folder subscribe',
      },
    }
    return (key: string, variables?: Record<string, string>) => {
      let result = translations[namespace]?.[key] ?? key
      if (variables) {
        Object.entries(variables).forEach(([k, v]) => {
          result = result.replace(`{{${k}}}`, v)
        })
      }
      return result
    }
  })
})

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('MailGeneralSettingsForm', () => {
  describe('rendering', () => {
    it('renders without crashing when data is undefined', () => {
      render(<MailGeneralSettingsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('button-group')).toBeInTheDocument()
    })

    it('renders the form element with correct base styles', () => {
      const { container } = render(
        <MailGeneralSettingsForm data={undefined} update={mockUpdate} />
      )

      expect(container.querySelector('form')).toHaveClass('p-4')
    })

    it('renders the fixed button group with reset and submit', () => {
      render(<MailGeneralSettingsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeInTheDocument()
      expect(screen.getByTestId('submit-btn')).toBeInTheDocument()
    })

    it('disables reset and submit buttons when the form is pristine', () => {
      render(<MailGeneralSettingsForm data={undefined} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeDisabled()
      expect(screen.getByTestId('submit-btn')).toBeDisabled()
    })
  })

  describe('field labels', () => {
    it('renders the compose mail window label', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Compose mail window')).toBeInTheDocument()
    })

    it('renders the collect unknown addresses label', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Collect unknown addresses')).toBeInTheDocument()
    })

    it('renders the forward messages label', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Forward messages')).toBeInTheDocument()
    })

    it('renders the start reply and place signature labels', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Start reply')).toBeInTheDocument()
      expect(screen.getByText('Place signature')).toBeInTheDocument()
    })

    it('renders the sign on new, reply, and forward labels', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Sign on new')).toBeInTheDocument()
      expect(screen.getByText('Sign on reply')).toBeInTheDocument()
      expect(screen.getByText('Sign on forward')).toBeInTheDocument()
    })

    it('renders the allow read receipts label', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Allow read receipts')).toBeInTheDocument()
    })

    it('renders the mail folder subscribe label', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(screen.getByText('Mail folder subscribe')).toBeInTheDocument()
    })
  })

  describe('checkboxes', () => {
    it('renders all checkboxes', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      // collectUnknownAddresses, countAllUnseen, sortByThreads,
      // hideInlineAttachments, signOnNew, signOnReply, signOnForward,
      // displayRemoteImages, mailAllowReceipt, mailfolderSubscribe
      expect(screen.getAllByRole('checkbox')).toHaveLength(9)
    })
  })

  describe('select fields', () => {
    it('renders select dropdowns', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      // composeMailWindow, forwardMessages, startReply, placeSignature, composeIn
      expect(screen.getAllByTestId('select')).toHaveLength(6)
    })
  })

  describe('address book name input', () => {
    it('renders the address book name input', () => {
      render(
        <MailGeneralSettingsForm data={mockData as any} update={mockUpdate} />
      )

      expect(
        screen.getByPlaceholderText('Address book name')
      ).toBeInTheDocument()
    })

    it('disables the address book name input when collectUnknownAddresses is false', () => {
      render(
        <MailGeneralSettingsForm
          data={{ ...mockData, collectUnknownAddresses: false } as any}
          update={mockUpdate}
        />
      )

      expect(screen.getByPlaceholderText('Address book name')).toBeDisabled()
    })

    it('enables the address book name input when collectUnknownAddresses is true', () => {
      render(
        <MailGeneralSettingsForm
          data={{ ...mockData, collectUnknownAddresses: true } as any}
          update={mockUpdate}
        />
      )

      expect(
        screen.getByPlaceholderText('Address book name')
      ).not.toBeDisabled()
    })
  })

  describe('translations', () => {
    it('calls useTranslations with the correct namespace', () => {
      render(<MailGeneralSettingsForm data={undefined} update={mockUpdate} />)

      expect(useTranslations).toHaveBeenCalledWith('US_MAIL_GENERAL')
    })
  })
})
