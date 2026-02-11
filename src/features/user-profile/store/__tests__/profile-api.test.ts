import '@testing-library/jest-dom'

// Mock apiSlice
const mockInjectEndpoints = jest.fn(() => ({
  endpoints: {},
  useGetUserProfileQuery: jest.fn(),
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    injectEndpoints: mockInjectEndpoints,
  },
}))

describe('Profile API', () => {
  it('should export profileApi and hooks without crashing', async () => {
    const { profileApi, useGetUserProfileQuery } = await import(
      '../profile-api'
    )

    expect(profileApi).toBeDefined()
    expect(useGetUserProfileQuery).toBeDefined()
    expect(mockInjectEndpoints).toHaveBeenCalled()
  })
})
