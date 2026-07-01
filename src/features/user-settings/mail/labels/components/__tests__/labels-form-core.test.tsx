import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useTranslations } from 'next-intl'
import type { MailLabel } from '../../mail-labels-types'

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: React.ComponentProps<'button'>) => (
    <button {...props}>{children}</button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: (props: React.ComponentProps<'input'>) => <input {...props} />,
}))

jest.mock('@/components/ui/form', () => ({
  Form: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  FormControl: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  FormField: ({ render }: { render: (args: unknown) => React.ReactNode }) =>
    render({ field: { value: '', onChange: jest.fn() } }),
  FormItem: ({
    children,
    ...props
  }: {
    children: React.ReactNode
  }) => <div {...props}>{children}</div>,
  FormLabel: ({
    children,
    ...props
  }: {
    children: React.ReactNode
  }) => <label {...props}>{children}</label>,
}))

jest.mock('@/components/ui/color-picker/color-container', () => ({
  __esModule: true,
  default: ({ containerId }: { containerId: string }) => (
    <div data-testid={`color-container-${containerId}`} />
  ),
}))

jest.mock('@/components/ui/forms/fixed-form-button-group', () => ({
  __esModule: true,
  default: ({
    onReset,
    disableReset,
    disableSubmit,
  }: {
    onReset: () => void
    disableReset: boolean
    disableSubmit: boolean
  }) => (
    <div data-testid="button-group">
      <button
        type="button"
        onClick={onReset}
        disabled={disableReset}
        data-testid="reset-btn"
      >
        Reset
      </button>
      <button type="submit" disabled={disableSubmit} data-testid="submit-btn">
        Submit
      </button>
    </div>
  ),
}))

jest.mock('lucide-react', () => ({
  Trash2: () => <svg data-testid="trash-icon" />,
}))

jest.mock('@/lib/utils/create-client-id', () => ({
  createClientId: jest.fn(() => 'new-label-id'),
}))

jest.mock('@hookform/resolvers/zod', () => ({
  zodResolver: jest.fn(() => async (values: unknown) => ({ values, errors: {} })),
}))

import MailLabelsSettingsForm from '../labels-form-core'

const mockUpdate = jest.fn()

const sampleLabels: MailLabel[] = [
  {
    id: 'l1',
    label: 'Work',
    IMAPLabel: 'work',
    color: '#3b82f6',
  },
  {
    id: 'l2',
    label: 'Personal',
    IMAPLabel: 'personal',
    color: '#ef4444',
  },
]

function setupTranslations() {
  ;(useTranslations as jest.Mock).mockImplementation((namespace: string) => {
    const translations: Record<string, Record<string, string>> = {
      FORM_COMMONS: {
        'create.default.string': 'Create label',
      },
      US_MAIL_LABELS: {
        'label.string': 'Label',
        'imap_label.string': 'IMAP label',
      },
    }

    return (key: string) => translations[namespace]?.[key] ?? key
  })
}

describe('MailLabelsSettingsForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    setupTranslations()
  })

  describe('basic rendering', () => {
    it('renders create button and action group', () => {
      render(<MailLabelsSettingsForm data={undefined} update={mockUpdate} />)

      expect(
        screen.getByRole('button', { name: 'Create label' })
      ).toBeInTheDocument()
      expect(screen.getByTestId('button-group')).toBeInTheDocument()
    })

    it('renders one row per existing label', () => {
      render(<MailLabelsSettingsForm data={sampleLabels} update={mockUpdate} />)

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(2)
      expect(screen.getAllByText('Label')).toHaveLength(2)
      expect(screen.getAllByText('IMAP label')).toHaveLength(2)
    })
  })

  describe('configuration', () => {
    it('disables reset and submit when the form is pristine', () => {
      render(<MailLabelsSettingsForm data={sampleLabels} update={mockUpdate} />)

      expect(screen.getByTestId('reset-btn')).toBeDisabled()
      expect(screen.getByTestId('submit-btn')).toBeDisabled()
    })

    it('exposes accessible remove labels for each row', () => {
      render(<MailLabelsSettingsForm data={sampleLabels} update={mockUpdate} />)

      expect(screen.getByLabelText('Remove label Work')).toBeInTheDocument()
      expect(screen.getByLabelText('Remove label Personal')).toBeInTheDocument()
    })
  })

  describe('integration', () => {
    it('adds a label row when create is clicked', async () => {
      const user = userEvent.setup()

      render(<MailLabelsSettingsForm data={sampleLabels} update={mockUpdate} />)

      await user.click(screen.getByRole('button', { name: 'Create label' }))

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(3)
    })

    it('removes a label row when delete is clicked', async () => {
      const user = userEvent.setup()

      render(<MailLabelsSettingsForm data={sampleLabels} update={mockUpdate} />)

      await user.click(screen.getByLabelText('Remove label Work'))

      expect(screen.getAllByTestId('trash-icon')).toHaveLength(1)
      expect(screen.queryByLabelText('Remove label Work')).not.toBeInTheDocument()
    })
  })
})
