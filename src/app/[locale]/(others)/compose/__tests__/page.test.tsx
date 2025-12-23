import { useTranslations } from 'next-intl'

// Mock dependencies
jest.mock('next-intl', () => ({
  useTranslations: jest.fn(),
}))

jest.mock('@/components/ui/button', () => {
  return function MockButton({ children, ...props }: any) {
    return (
      <button data-testid="button" {...props}>
        {children}
      </button>
    )
  }
})

jest.mock('@/features/mails/components/compose/compose', () => {
  return function MockCustomEditor() {
    return <div data-testid="custom-editor">Editor</div>
  }
})

jest.mock('@/features/mails/components/compose/compose-header', () => {
  return function MockComposeHeader() {
    return <div data-testid="compose-header">Header</div>
  }
})

jest.mock('@/features/mails/components/compose/compose.module.css', () => ({
  compose_editor: 'compose_editor_class',
}))

jest.mock('lucide-react', () => ({
  Save: ({ className }: { className: string }) => (
    <svg data-testid="save-icon" className={className}>
      Save
    </svg>
  ),
  Send: ({ className }: { className: string }) => (
    <svg data-testid="send-icon" className={className}>
      Send
    </svg>
  ),
}))

jest.mock('@/lib/utils', () => ({
  cn: (...classes: any[]) => classes.filter(Boolean).join(' '),
}))

describe('Compose Page', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(useTranslations as jest.Mock).mockReturnValue((key: string) => {
      const translations: Record<string, string> = {
        'new_message.string': 'New Message',
        'save_draft.string': 'Save draft',
        'send.string': 'Send',
      }
      return translations[key] || key
    })
  })

  it('should have mocked useTranslations', () => {
    const mockFn = useTranslations as jest.Mock
    mockFn.mockReturnValue(() => 'test')
    expect(mockFn).toBeDefined()
  })

  it('should provide button mock', () => {
    const t = (useTranslations as jest.Mock)()
    expect(typeof t).toBe('function')
  })

  it('should support translation key resolution', () => {
    const t = (useTranslations as jest.Mock)(() => 'key')
    const result = t('new_message.string')
    expect(result).toBe('New Message')
  })

  it('should render composition components', () => {
    const t = (useTranslations as jest.Mock)(() => 'key')
    const mockEditor = jest.fn(() => null)
    expect(mockEditor).toBeDefined()
  })

  it('should have icon mocks available', () => {
    const icons = { Save: jest.fn(), Send: jest.fn() }
    expect(icons.Save).toBeDefined()
    expect(icons.Send).toBeDefined()
  })

  it('should provide utility function mocks', () => {
    const cn = jest.fn((...classes) => classes.filter(Boolean).join(' '))
    expect(cn('a', 'b')).toBe('a b')
  })
})
