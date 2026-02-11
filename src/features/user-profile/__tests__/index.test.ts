import '@testing-library/jest-dom'

describe('User Profile Index', () => {
  it('should export all types without crashing', async () => {
    const types = await import('../index')

    // Verify type exports exist (they are type-only exports)
    expect(types).toBeDefined()
  })

  it('should export profileApi and useGetUserProfileQuery', async () => {
    const { profileApi, useGetUserProfileQuery } = await import('../index')

    expect(profileApi).toBeDefined()
    expect(useGetUserProfileQuery).toBeDefined()
  })

  it('should export useProfile hook', async () => {
    const { useProfile } = await import('../index')

    expect(useProfile).toBeDefined()
    expect(typeof useProfile).toBe('function')
  })
})
