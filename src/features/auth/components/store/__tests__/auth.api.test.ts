import '@testing-library/jest-dom'

// Mock apiSlice
const mockInjectEndpoints = jest.fn(() => ({
  endpoints: {},
  useLoginMutation: jest.fn(),
  useGetAuthModeQuery: jest.fn(),
}))

jest.mock('@/lib/redux/api/api-slice', () => ({
  apiSlice: {
    injectEndpoints: mockInjectEndpoints,
  },
}))

describe('Auth API', () => {
  it('should export authApi and hooks without crashing', async () => {
    const { authApi, useLoginMutation, useGetAuthModeQuery } = await import(
      '../auth.api'
    )

    expect(authApi).toBeDefined()
    expect(useLoginMutation).toBeDefined()
    expect(useGetAuthModeQuery).toBeDefined()
  })
})
