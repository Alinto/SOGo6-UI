import '@testing-library/jest-dom'
import { renderHook } from '@testing-library/react'
import { useAppSelector } from '@/lib/redux/hooks'
import { useGetUserProfileQuery } from '../../store/profile-api'
import { useProfile } from '../use-profile'

jest.mock('@/lib/redux/hooks', () => ({
  useAppSelector: jest.fn(),
}))

jest.mock('../../store/profile-api', () => ({
  useGetUserProfileQuery: jest.fn(),
}))

describe('useProfile', () => {
  const mockUseGetUserProfileQuery = useGetUserProfileQuery as jest.Mock
  const mockUseAppSelector = useAppSelector as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return profile data structure', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: {
        mailboxes: [],
        prefs: {},
        ui: {},
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current).toHaveProperty('profile')
    expect(result.current).toHaveProperty('isLoading')
    expect(result.current).toHaveProperty('isError')
    expect(result.current).toHaveProperty('error')
    expect(result.current).toHaveProperty('refetch')
    expect(result.current).toHaveProperty('user')
    expect(result.current).toHaveProperty('mainAccount')
    expect(result.current).toHaveProperty('externalAccounts')
    expect(result.current).toHaveProperty('allMailboxes')
    expect(result.current).toHaveProperty('defaultIdentity')
    expect(result.current).toHaveProperty('preferences')
    expect(result.current).toHaveProperty('uiSettings')
  })

  it('should extract domain from uid', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.user?.domain).toBe('sogo.nu')
  })

  it('should handle uid without @ symbol', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.user?.domain).toBe('')
  })

  it('should separate main account from external accounts', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: {
        mailboxes: [
          {
            id: '0',
            identities: [],
            receipts: {},
            certificates: {},
          },
          {
            id: 'abc123',
            name: 'External Account',
            identities: [],
            receipts: {},
            certificates: {},
          },
        ],
        prefs: {},
        ui: {},
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.mainAccount?.id).toBe('0')
    expect(result.current.externalAccounts.length).toBe(1)
    expect(result.current.externalAccounts[0].id).toBe('abc123')
  })

  it('should find default identity', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: {
        mailboxes: [
          {
            id: '0',
            identities: [
              {
                mail: 'user@sogo.nu',
                name: 'John Doe',
                replyTo: 'user@sogo.nu',
                isDefault: false,
                signatures: {},
              },
              {
                mail: 'john.doe@sogo.nu',
                name: 'John Doe',
                replyTo: 'john.doe@sogo.nu',
                isDefault: true,
                signatures: {},
              },
            ],
            receipts: {},
            certificates: {},
          },
        ],
        prefs: {},
        ui: {},
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.defaultIdentity?.mail).toBe('john.doe@sogo.nu')
    expect(result.current.defaultIdentity?.isDefault).toBe(true)
  })

  it('should return null user when authUser is null', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue(null)

    const { result } = renderHook(() => useProfile())

    expect(result.current.user).toBeNull()
  })

  it('should expose preference shortcuts', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: {
        mailboxes: [],
        prefs: {
          USER_GENERAL: {
            SOGO_U_LANGUAGE: 'fr',
            SOGO_U_TIMEZONE: 'America/New_York',
            SOGO_U_FIRST_MODULE: 'calendar',
          },
          USER_SECURITY: {
            SOGO_U_MFA_ENABLE: true,
          },
        },
        ui: {},
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.language).toBe('fr')
    expect(result.current.timezone).toBe('America/New_York')
    expect(result.current.firstModule).toBe('calendar')
    expect(result.current.mfaEnabled).toBe(true)
  })

  it('should expose UI settings shortcuts', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: {
        mailboxes: [],
        prefs: {},
        ui: {
          SOGO_D_ALLOW_EXT_MAIL_ACCOUNT: true,
          SOGO_D_IDENTITIES_ENABLED: true,
          SOGO_D_IDENTITIES_CUSTOM_FROM_ENABLED: false,
          SOGO_D_MODULE_ACCESS: ['mail', 'calendar'],
          SOGO_D_LOGIN_MFA: true,
          SOGO_D_PWD_CHANGE_ENABLED: true,
        },
      },
      isLoading: false,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.canAddExternalAccount).toBe(true)
    expect(result.current.identitiesEnabled).toBe(true)
    expect(result.current.customFromEnabled).toBe(false)
    expect(result.current.moduleAccess).toEqual(['mail', 'calendar'])
    expect(result.current.mfaAvailable).toBe(true)
    expect(result.current.passwordChangeEnabled).toBe(true)
  })

  it('should handle loading state', () => {
    mockUseGetUserProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: undefined,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.isLoading).toBe(true)
  })

  it('should handle error state', () => {
    const mockError = new Error('Profile fetch failed')

    mockUseGetUserProfileQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: mockError,
      refetch: jest.fn(),
    })

    mockUseAppSelector.mockReturnValue({
      uid: 'user@sogo.nu',
      cn: 'John Doe',
      email: 'user@sogo.nu',
    })

    const { result } = renderHook(() => useProfile())

    expect(result.current.isError).toBe(true)
    expect(result.current.error).toBe(mockError)
  })
})
