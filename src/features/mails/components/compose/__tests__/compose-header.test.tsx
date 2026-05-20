import { fireEvent, render, screen } from '@testing-library/react'
import ComposeHeader from '../compose-header'

// --- Mocks ---

jest.mock('next-intl', () => ({
  useTranslations: jest.fn(() => (key: string) => key),
}))

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))

jest.mock('@/components/ui/input', () => ({
  Input: ({ placeholder, value, readOnly }: any) => (
    <input placeholder={placeholder} defaultValue={value} readOnly={readOnly} />
  ),
}))

jest.mock('@/components/ui/select', () => ({
  Select: ({ children, value, onValueChange, disabled }: any) => (
    <div data-testid="select" data-value={value} data-disabled={disabled}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children }: any) => <div>{children}</div>,
  SelectValue: ({ placeholder }: any) => <span>{placeholder}</span>,
  SelectContent: ({ children }: any) => <div>{children}</div>,
  SelectItem: ({ children, value }: any) => (
    <div data-value={value}>{children}</div>
  ),
}))

jest.mock('lucide-react/dynamic', () => ({
  DynamicIcon: ({ name }: { name: string }) => <span>{name}</span>,
  iconNames: [],
}))

jest.mock('@/components/ui/inputs/input-with-tags', () => ({
  __esModule: true,
  default: ({ name, placeholder }: { name: string; placeholder: string }) => (
    <input data-testid={name} placeholder={placeholder} />
  ),
}))

jest.mock('@/lib/redux/hooks', () => ({
  useAppDispatch: jest.fn(() => jest.fn()),
  useAppSelector: jest.fn(() => null),
}))

jest.mock('@/features/mails/store/mail-compose-slice', () => ({
  setPendingInsert: jest.fn(),
  updateRecipients: jest.fn(),
}))

jest.mock('@/features/user-profile', () => ({
  useProfile: jest.fn(),
}))

// --- Imports après les mocks ---

import { useProfile } from '@/features/user-profile'

// --- Helper ---

const mockProfile = (overrides = {}) => {
  ;(useProfile as jest.Mock).mockReturnValue({
    mainAccount: {
      identities: [{ mail: 'jdoe@sogo.nu', name: 'John Doe' }],
    },
    externalAccounts: [],
    defaultIdentity: { mail: 'jdoe@sogo.nu' },
    identitiesEnabled: false,
    customFromEnabled: false,
    user: { email: 'jdoe@sogo.nu' },
    jitsiLinkEnabled: false,
    jitsiBaseUrl: null,
    mailMaxRecipient: 0,
    ...overrides,
  })
}

// --- Tests ---

describe('ComposeHeader', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Render de base', () => {
    it('should render without crashing', () => {
      mockProfile()
      render(<ComposeHeader />)
    })

    it('should render To field', () => {
      mockProfile()
      render(<ComposeHeader />)
      expect(screen.getByPlaceholderText('to.string')).toBeInTheDocument()
    })

    it('should render Subject field', () => {
      mockProfile()
      render(<ComposeHeader />)
      expect(screen.getByPlaceholderText('subject.string')).toBeInTheDocument()
    })

    it('should render CC and BCC buttons', () => {
      mockProfile()
      render(<ComposeHeader />)
      expect(screen.getByText('cc.string')).toBeInTheDocument()
      expect(screen.getByText('bcc.string')).toBeInTheDocument()
    })

    it('should not render close button when onClose is not provided', () => {
      mockProfile()
      render(<ComposeHeader />)
      expect(screen.queryByText('close.string')).not.toBeInTheDocument()
    })
  })

  describe('Champ From', () => {
    it('should render readonly input when identitiesEnabled is false', () => {
      mockProfile({ identitiesEnabled: false })
      render(<ComposeHeader />)
      const input = screen.getByDisplayValue('jdoe@sogo.nu')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('readonly')
    })

    it('should render disabled select when identitiesEnabled true but customFromEnabled false', () => {
      mockProfile({
        identitiesEnabled: true,
        customFromEnabled: false,
        mainAccount: {
          identities: [
            { mail: 'jdoe@sogo.nu', name: 'John' },
            { mail: 'alias@sogo.nu', name: 'Alias' },
          ],
        },
      })
      render(<ComposeHeader />)
      const select = screen.getByTestId('select')
      expect(select).toHaveAttribute('data-disabled', 'true')
    })

    it('should render active select when identitiesEnabled and customFromEnabled are true', () => {
      mockProfile({
        identitiesEnabled: true,
        customFromEnabled: true,
        mainAccount: {
          identities: [
            { mail: 'jdoe@sogo.nu', name: 'John' },
            { mail: 'alias@sogo.nu', name: 'Alias' },
          ],
        },
      })
      render(<ComposeHeader />)
      const select = screen.getByTestId('select')
      expect(select).not.toHaveAttribute('data-disabled')
    })

    it('should fallback to user email when no defaultIdentity', () => {
      mockProfile({
        defaultIdentity: null,
        user: { email: 'fallback@sogo.nu' },
      })
      render(<ComposeHeader />)
      expect(screen.getByDisplayValue('fallback@sogo.nu')).toBeInTheDocument()
    })
  })

  describe('Toggle CC / BCC', () => {
    it('should not show CC input by default', () => {
      mockProfile()
      render(<ComposeHeader />)
      // 2 inputs visibles : To + Subject
      expect(screen.getAllByRole('textbox')).toHaveLength(3) // from + to + subject
    })

    it('should show CC input when CC button is clicked', () => {
      mockProfile()
      render(<ComposeHeader />)
      fireEvent.click(screen.getByText('cc.string'))
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(3)
    })

    it('should hide CC input when CC button is clicked again', () => {
      mockProfile()
      render(<ComposeHeader />)
      fireEvent.click(screen.getByText('cc.string'))
      fireEvent.click(screen.getByText('cc.string'))
      expect(screen.getAllByRole('textbox')).toHaveLength(3)
    })

    it('should show BCC input when BCC button is clicked', () => {
      mockProfile()
      render(<ComposeHeader />)
      fireEvent.click(screen.getByText('bcc.string'))
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(3)
    })

    it('should show both CC and BCC inputs simultaneously', () => {
      mockProfile()
      render(<ComposeHeader />)
      fireEvent.click(screen.getByText('cc.string'))
      fireEvent.click(screen.getByText('bcc.string'))
      expect(screen.getAllByRole('textbox').length).toBeGreaterThan(4)
    })
  })
})
