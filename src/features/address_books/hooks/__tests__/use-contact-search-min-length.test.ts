import { renderHook } from '@testing-library/react'

const mockUseProfile = jest.fn()

jest.mock('@/features/user-profile', () => ({
  useProfile: () => mockUseProfile(),
}))

import { useContactSearchMinLength } from '../use-contact-search-min-length'

describe('useContactSearchMinLength', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns configured min length from profile', () => {
    mockUseProfile.mockReturnValue({
      uiSettings: { SOGO_D_AUTOCOMPLETION_MIN_LEN: 3 },
    })

    const { result } = renderHook(() => useContactSearchMinLength())
    expect(result.current).toBe(3)
  })

  it('falls back to default when profile setting is missing', () => {
    mockUseProfile.mockReturnValue({ uiSettings: undefined })

    const { result } = renderHook(() => useContactSearchMinLength())
    expect(result.current).toBe(2)
  })
})
