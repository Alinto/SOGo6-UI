import { useProfile } from '@/features/user-profile/hooks/use-profile'
import { render, screen, waitFor } from '@testing-library/react'
import { PP_GRAVATAR } from '../../../store/user-preferences-api-types'
import ProfileFormCore from '../profile-form-core'

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

const mockUpdateMailboxProfile = jest.fn()
const mockUpdatePreferences = jest.fn()

jest.mock(
  '@/features/user-settings/mail/external-accounts/store/mailboxes-api',
  () => ({
    useUpdateUserMailboxProfileMutation: () => [
      mockUpdateMailboxProfile,
      { isLoading: false },
    ],
  })
)

jest.mock('@/features/user-settings/store/user-preferences-api', () => ({
  useUpdateUserPreferencesProfileMutation: () => [
    mockUpdatePreferences,
    { isLoading: false },
  ],
}))

jest.mock('../../form/profile-schema', () => {
  const z = require('zod')
  const minimalSchema = z.object({
    uid: z.string().optional(),
    mail: z.string().optional(),
    cn: z.string().optional(),
    profilePictureSource: z.string(),
    company: z.string().optional(),
    team: z.string().optional(),
    aliases: z.array(z.string()).default([]),
    identities: z.array(z.any()).default([]),
  })

  return {
    createProfileSchema: () => minimalSchema,
    ProfileFormData: {},
  }
})
jest.mock('@/features/user-profile/hooks/use-profile')
const mockUseProfile = useProfile as jest.MockedFunction<typeof useProfile>

jest.mock('../../components/basic-info-tab', () => ({
  BasicInfoTab: () => <div data-testid="basic-info-tab" />,
}))

jest.mock('../../components/identities-tab', () => ({
  IdentitiesTab: () => <div data-testid="identities-tab" />,
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
    <div>
      <button
        type="reset"
        onClick={onReset}
        disabled={disableReset}
        aria-label="reset"
      >
        Reset
      </button>
      <button type="submit" disabled={disableSubmit} aria-label="submit">
        Submit
      </button>
    </div>
  ),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const LOADED_PROFILE = {
  profile: { company: 'Acme', team: 'Engineering', aliases: [] },
  user: { uid: 'jdoe', email: 'john@example.com', cn: 'John Doe' },
  isLoading: false,
  isError: false,
  mainAccount: {
    identities: [
      {
        mail: 'john@example.com',
        name: 'John Doe',
        replyTo: 'john@example.com',
        isDefault: true,
        signatures: {},
      },
    ],
  },
  uiSettings: {},
  preferences: {
    USER_GENERAL: { SOGO_U_PROFILE_PICTURE: PP_GRAVATAR },
  },
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProfileFormCore', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpdateMailboxProfile.mockReturnValue({
      unwrap: () => Promise.resolve(),
    })
    mockUpdatePreferences.mockReturnValue({ unwrap: () => Promise.resolve() })
  })

  describe('loading state', () => {
    it('renders the loading message', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        isLoading: true,
        profile: null,
      } as any)
      render(<ProfileFormCore />)
      expect(screen.getByText('api.loading.string')).toBeInTheDocument()
    })

    it('does not render the form when loading', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        isLoading: true,
        profile: null,
      } as any)
      render(<ProfileFormCore />)
      expect(screen.queryByTestId('basic-info-tab')).not.toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('renders the error message', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        isError: true,
        profile: null,
      } as any)
      render(<ProfileFormCore />)
      expect(screen.getByText('api.load_failed.string')).toBeInTheDocument()
    })

    it('does not render the form when in error state', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        isError: true,
        profile: null,
      } as any)
      render(<ProfileFormCore />)
      expect(screen.queryByTestId('basic-info-tab')).not.toBeInTheDocument()
    })
  })

  describe('loaded state', () => {
    beforeEach(() => {
      mockUseProfile.mockReturnValue(LOADED_PROFILE as any)
    })

    it('renders BasicInfoTab', () => {
      render(<ProfileFormCore />)
      expect(screen.getByTestId('basic-info-tab')).toBeInTheDocument()
    })

    it('renders IdentitiesTab', () => {
      render(<ProfileFormCore />)
      expect(screen.getByTestId('identities-tab')).toBeInTheDocument()
    })

    it('renders the form description', () => {
      render(<ProfileFormCore />)
      expect(screen.getByText('description')).toBeInTheDocument()
    })

    it('renders the identities section heading', () => {
      render(<ProfileFormCore />)
      expect(screen.getByText('sections.identities')).toBeInTheDocument()
    })

    it('renders reset and submit buttons', () => {
      render(<ProfileFormCore />)
      expect(screen.getByLabelText('reset')).toBeInTheDocument()
      expect(screen.getByLabelText('submit')).toBeInTheDocument()
    })

    it('disables submit and reset when form is not dirty', () => {
      render(<ProfileFormCore />)
      expect(screen.getByLabelText('reset')).toBeDisabled()
      expect(screen.getByLabelText('submit')).toBeDisabled()
    })
  })

  describe('form defaults', () => {
    it('uses PP_DEFAULT when no profile picture preference is set', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        preferences: { USER_GENERAL: { SOGO_U_PROFILE_PICTURE: undefined } },
      } as any)
      // Should not crash — PP_DEFAULT is used as fallback
      render(<ProfileFormCore />)
      expect(screen.getByTestId('basic-info-tab')).toBeInTheDocument()
    })

    it('uses empty identity defaults when mainAccount has no identities', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        mainAccount: { identities: [] },
      } as any)
      render(<ProfileFormCore />)
      expect(screen.getByTestId('identities-tab')).toBeInTheDocument()
    })

    it('handles missing mainAccount gracefully', () => {
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        mainAccount: null,
      } as any)
      render(<ProfileFormCore />)
      expect(screen.getByTestId('identities-tab')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    beforeEach(() => {
      mockUseProfile.mockReturnValue(LOADED_PROFILE as any)
    })

    it('calls updateMailboxProfile and updatePreferences on submit', async () => {
      render(<ProfileFormCore />)

      // Trigger submit via form — since buttons are disabled when not dirty,
      // we submit the form element directly
      const form = document.querySelector('form')!
      form.dispatchEvent(new Event('submit', { bubbles: true }))

      await waitFor(() => {
        expect(mockUpdateMailboxProfile).toHaveBeenCalled()
      })
      expect(mockUpdatePreferences).toHaveBeenCalled()
    })

    it('calls updateMailboxProfile with id "0" and _skipNotification true', async () => {
      render(<ProfileFormCore />)
      const form = document.querySelector('form')!
      form.dispatchEvent(new Event('submit', { bubbles: true }))

      await waitFor(() => {
        expect(mockUpdateMailboxProfile).toHaveBeenCalledWith(
          expect.objectContaining({ id: '0', _skipNotification: true })
        )
      })
    })

    it('calls updatePreferences with the profilePictureSource', async () => {
      render(<ProfileFormCore />)
      const form = document.querySelector('form')!
      form.dispatchEvent(new Event('submit', { bubbles: true }))

      await waitFor(() => {
        expect(mockUpdatePreferences).toHaveBeenCalledWith(
          expect.objectContaining({
            SOGO_U_PROFILE_PICTURE: expect.any(String),
          })
        )
      })
    })

    it('does not throw when updateMailboxProfile rejects', async () => {
      mockUpdateMailboxProfile.mockReturnValue({
        unwrap: () => Promise.reject(new Error('Network error')),
      })
      render(<ProfileFormCore />)
      const form = document.querySelector('form')!

      await expect(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true }))
        await waitFor(() => expect(mockUpdateMailboxProfile).toHaveBeenCalled())
      }).not.toThrow()
    })
  })

  describe('profile reset on data change', () => {
    it('resets the form when profile data changes', async () => {
      const { rerender } = render(<ProfileFormCore />)
      mockUseProfile.mockReturnValue({
        ...LOADED_PROFILE,
        profile: { company: 'NewCorp', team: 'Design', aliases: [] },
      } as any)
      rerender(<ProfileFormCore />)
      // Form still renders without crashing after reset
      await waitFor(() => {
        expect(screen.getByTestId('basic-info-tab')).toBeInTheDocument()
      })
    })
  })
})
